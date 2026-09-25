using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EmployeesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Employees?page=1&pageSize=5&search=john
    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<Employee>>> GetEmployees(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string? search = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;

        try
        {
            await _context.Database.EnsureCreatedAsync();

            IQueryable<Employee> query = _context.Employees;

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.Trim().ToLower();
                query = query.Where(e =>
                    e.Name.ToLower().Contains(searchLower) ||
                    e.EmployeId.ToString().Contains(searchLower) ||
                    e.PhoneNumber.Contains(searchLower) ||
                    e.JoingDate.Contains(searchLower));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(e => e.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = new PaginatedResponse<Employee>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error accessing database", error = ex.Message });
        }
    }

    // GET: api/Employees/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Employee>> GetEmployee(int id)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }
            return Ok(employee);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error accessing database", error = ex.Message });
        }
    }

    // POST: api/Employees
    [HttpPost]
    public async Task<ActionResult<Employee>> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            await _context.Database.EnsureCreatedAsync();

            var employee = new Employee
            {
                Name = dto.Name,
                EmployeId = dto.EmployeId,
                EmployeSalary = dto.EmployeSalary,
                LeavesCount = dto.LeavesCount,
                JoingDate = dto.JoingDate,
                DateOfBirth = dto.DateOfBirth,
                PhoneNumber = dto.PhoneNumber
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error saving employee to database", error = ex.Message });
        }
    }

    // PUT: api/Employees/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }

            employee.Name = dto.Name;
            employee.EmployeId = dto.EmployeId;
            employee.EmployeSalary = dto.EmployeSalary;
            employee.LeavesCount = dto.LeavesCount;
            employee.JoingDate = dto.JoingDate;
            employee.DateOfBirth = dto.DateOfBirth;
            employee.PhoneNumber = dto.PhoneNumber;

            await _context.SaveChangesAsync();
            return Ok(employee);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating employee", error = ex.Message });
        }
    }

    // DELETE: api/Employees/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound(new { message = $"Employee with ID {id} not found." });
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Employee deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting employee", error = ex.Message });
        }
    }
}
