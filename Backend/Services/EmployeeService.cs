using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _context;

    public EmployeeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<EmployeeDto>> GetEmployeesAsync(EmployeeQueryParams queryParams)
    {
        var query = _context.Employees.AsNoTracking().AsQueryable();

        // Search filter
        if (!string.IsNullOrWhiteSpace(queryParams.Search))
        {
            var search = queryParams.Search.Trim().ToLower();
            query = query.Where(e =>
                e.FirstName.ToLower().Contains(search) ||
                e.LastName.ToLower().Contains(search) ||
                e.Email.ToLower().Contains(search) ||
                e.Position.ToLower().Contains(search) ||
                e.Department.ToLower().Contains(search)
            );
        }

        // Department filter
        if (!string.IsNullOrWhiteSpace(queryParams.Department))
        {
            query = query.Where(e => e.Department == queryParams.Department);
        }

        // Active status filter
        if (queryParams.IsActive.HasValue)
        {
            query = query.Where(e => e.IsActive == queryParams.IsActive.Value);
        }

        // Sorting
        query = queryParams.SortBy?.ToLower() switch
        {
            "name" => queryParams.SortDescending
                ? query.OrderByDescending(e => e.FirstName).ThenByDescending(e => e.LastName)
                : query.OrderBy(e => e.FirstName).ThenBy(e => e.LastName),
            "email" => queryParams.SortDescending ? query.OrderByDescending(e => e.Email) : query.OrderBy(e => e.Email),
            "department" => queryParams.SortDescending ? query.OrderByDescending(e => e.Department) : query.OrderBy(e => e.Department),
            "salary" => queryParams.SortDescending ? query.OrderByDescending(e => e.Salary) : query.OrderBy(e => e.Salary),
            "dateofjoining" => queryParams.SortDescending ? query.OrderByDescending(e => e.DateOfJoining) : query.OrderBy(e => e.DateOfJoining),
            _ => queryParams.SortDescending ? query.OrderByDescending(e => e.Id) : query.OrderBy(e => e.Id)
        };

        var totalCount = await query.CountAsync();
        var page = Math.Max(1, queryParams.Page);
        var pageSize = Math.Clamp(queryParams.PageSize, 1, 100);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => MapToDto(e))
            .ToListAsync();

        return new PagedResult<EmployeeDto>(items, totalCount, page, pageSize, totalPages);
    }

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(int id)
    {
        var employee = await _context.Employees.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        return employee == null ? null : MapToDto(employee);
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto)
    {
        var employee = new Employee
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            Phone = dto.Phone?.Trim() ?? string.Empty,
            Department = dto.Department.Trim(),
            Position = dto.Position.Trim(),
            Salary = dto.Salary,
            DateOfJoining = dto.DateOfJoining == default ? DateTime.UtcNow : dto.DateOfJoining,
            IsActive = dto.IsActive,
            AvatarUrl = dto.AvatarUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return MapToDto(employee);
    }

    public async Task<EmployeeDto?> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return null;

        employee.FirstName = dto.FirstName.Trim();
        employee.LastName = dto.LastName.Trim();
        employee.Email = dto.Email.Trim().ToLower();
        employee.Phone = dto.Phone?.Trim() ?? string.Empty;
        employee.Department = dto.Department.Trim();
        employee.Position = dto.Position.Trim();
        employee.Salary = dto.Salary;
        employee.DateOfJoining = dto.DateOfJoining;
        employee.IsActive = dto.IsActive;
        if (dto.AvatarUrl != null) employee.AvatarUrl = dto.AvatarUrl;
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(employee);
    }

    public async Task<bool> DeleteEmployeeAsync(int id)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null) return false;

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<string>> GetDepartmentsAsync()
    {
        return await _context.Employees
            .AsNoTracking()
            .Select(e => e.Department)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();
    }

    public async Task<EmployeeStatsDto> GetStatsAsync()
    {
        var employees = await _context.Employees.AsNoTracking().ToListAsync();

        var total = employees.Count;
        var active = employees.Count(e => e.IsActive);
        var inactive = total - active;
        var avgSalary = total > 0 ? employees.Average(e => e.Salary) : 0;

        var departments = employees
            .GroupBy(e => e.Department)
            .Select(g => new DepartmentStatDto(g.Key, g.Count()))
            .OrderByDescending(d => d.EmployeeCount)
            .ToList();

        return new EmployeeStatsDto(total, active, inactive, Math.Round(avgSalary, 2), departments.Count, departments);
    }

    private static EmployeeDto MapToDto(Employee e)
    {
        return new EmployeeDto(
            e.Id,
            e.FirstName,
            e.LastName,
            $"{e.FirstName} {e.LastName}",
            e.Email,
            e.Phone,
            e.Department,
            e.Position,
            e.Salary,
            e.DateOfJoining,
            e.IsActive,
            e.AvatarUrl,
            e.CreatedAt,
            e.UpdatedAt
        );
    }
}
