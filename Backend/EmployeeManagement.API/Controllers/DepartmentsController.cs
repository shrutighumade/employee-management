using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DepartmentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Departments?page=1&pageSize=5&search=eng
    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<DepartmentResponseDto>>> GetDepartments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string search = "")
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;

        try
        {
            if (!_context.Database.IsInMemory())
            {
                await _context.Database.EnsureCreatedAsync();
            }

            IQueryable<Department> query = _context.Departments.Include(d => d.Employees);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.Trim().ToLower();
                query = query.Where(d =>
                    d.Name.ToLower().Contains(searchLower) ||
                    d.Location.ToLower().Contains(searchLower) ||
                    d.Description.ToLower().Contains(searchLower));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(d => d.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(d => new DepartmentResponseDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    Description = d.Description,
                    Location = d.Location,
                    EmployeeCount = d.Employees.Count,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            var response = new PaginatedResponse<DepartmentResponseDto>
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

    // GET: api/Departments/5
    [HttpGet("{id}")]
    public async Task<ActionResult<DepartmentResponseDto>> GetDepartment(int id)
    {
        try
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            var employeeCount = await _context.Employees.CountAsync(e => e.DepartmentId == id);

            var response = new DepartmentResponseDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                Location = department.Location,
                EmployeeCount = employeeCount,
                CreatedAt = department.CreatedAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error accessing database", error = ex.Message });
        }
    }

    // GET: api/Departments/5/employees
    [HttpGet("{id}/employees")]
    public async Task<ActionResult<List<Employee>>> GetDepartmentEmployees(int id)
    {
        try
        {
            var departmentExists = await _context.Departments.AnyAsync(d => d.Id == id);
            if (!departmentExists)
            {
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            var employees = await _context.Employees
                .Where(e => e.DepartmentId == id)
                .OrderBy(e => e.Name)
                .ToListAsync();

            return Ok(employees);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error accessing database", error = ex.Message });
        }
    }

    // POST: api/Departments
    [HttpPost]
    public async Task<ActionResult<DepartmentResponseDto>> CreateDepartment([FromBody] CreateDepartmentDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            if (!_context.Database.IsInMemory())
            {
                await _context.Database.EnsureCreatedAsync();
            }

            var nameExists = await _context.Departments
                .AnyAsync(d => d.Name.ToLower() == dto.Name.Trim().ToLower());

            if (nameExists)
            {
                return Conflict(new { message = $"A department named '{dto.Name}' already exists." });
            }

            var department = new Department
            {
                Name = dto.Name.Trim(),
                Description = dto.Description.Trim(),
                Location = dto.Location.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            var response = new DepartmentResponseDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                Location = department.Location,
                EmployeeCount = 0,
                CreatedAt = department.CreatedAt
            };

            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error saving department to database", error = ex.Message });
        }
    }

    // PUT: api/Departments/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDepartment(int id, [FromBody] UpdateDepartmentDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            var nameConflict = await _context.Departments
                .AnyAsync(d => d.Name.ToLower() == dto.Name.Trim().ToLower() && d.Id != id);

            if (nameConflict)
            {
                return Conflict(new { message = $"Another department named '{dto.Name}' already exists." });
            }

            department.Name = dto.Name.Trim();
            department.Description = dto.Description.Trim();
            department.Location = dto.Location.Trim();

            await _context.SaveChangesAsync();

            var employeeCount = await _context.Employees.CountAsync(e => e.DepartmentId == id);

            return Ok(new DepartmentResponseDto
            {
                Id = department.Id,
                Name = department.Name,
                Description = department.Description,
                Location = department.Location,
                EmployeeCount = employeeCount,
                CreatedAt = department.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error updating department", error = ex.Message });
        }
    }

    // DELETE: api/Departments/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDepartment(int id)
    {
        try
        {
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.Id == id);

            if (department == null)
            {
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            var hasEmployees = await _context.Employees.AnyAsync(e => e.DepartmentId == id);
            if (hasEmployees)
            {
                var count = await _context.Employees.CountAsync(e => e.DepartmentId == id);
                return BadRequest(new { message = $"Cannot delete department '{department.Name}' because it has {count} employee(s) assigned to it." });
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Department deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error deleting department", error = ex.Message });
        }
    }
}
