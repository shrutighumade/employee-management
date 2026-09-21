using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeesController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    /// <summary>
    /// Gets paged, sorted, and filtered employees.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<EmployeeDto>>> GetEmployees([FromQuery] EmployeeQueryParams queryParams)
    {
        var result = await _employeeService.GetEmployeesAsync(queryParams);
        return Ok(result);
    }

    /// <summary>
    /// Gets a single employee by Id.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> GetEmployee(int id)
    {
        var employee = await _employeeService.GetEmployeeByIdAsync(id);
        if (employee == null) return NotFound(new { message = $"Employee with ID {id} not found." });
        return Ok(employee);
    }

    /// <summary>
    /// Creates a new employee.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> CreateEmployee([FromBody] CreateEmployeeDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var created = await _employeeService.CreateEmployeeAsync(dto);
        return CreatedAtAction(nameof(GetEmployee), new { id = created.Id }, created);
    }

    /// <summary>
    /// Updates an existing employee.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _employeeService.UpdateEmployeeAsync(id, dto);
        if (updated == null) return NotFound(new { message = $"Employee with ID {id} not found." });

        return Ok(updated);
    }

    /// <summary>
    /// Deletes an employee by Id.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
        var success = await _employeeService.DeleteEmployeeAsync(id);
        if (!success) return NotFound(new { message = $"Employee with ID {id} not found." });

        return NoContent();
    }

    /// <summary>
    /// Gets all unique department names.
    /// </summary>
    [HttpGet("departments")]
    public async Task<ActionResult<IEnumerable<string>>> GetDepartments()
    {
        var departments = await _employeeService.GetDepartmentsAsync();
        return Ok(departments);
    }

    /// <summary>
    /// Gets dashboard metrics and department distribution statistics.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<EmployeeStatsDto>> GetStats()
    {
        var stats = await _employeeService.GetStatsAsync();
        return Ok(stats);
    }
}
