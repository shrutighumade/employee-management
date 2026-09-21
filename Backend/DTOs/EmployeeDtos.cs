using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

public record EmployeeDto(
    int Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string Phone,
    string Department,
    string Position,
    decimal Salary,
    DateTime DateOfJoining,
    bool IsActive,
    string? AvatarUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateEmployeeDto(
    [Required, MaxLength(50)] string FirstName,
    [Required, MaxLength(50)] string LastName,
    [Required, EmailAddress, MaxLength(100)] string Email,
    [Phone, MaxLength(20)] string Phone,
    [Required, MaxLength(50)] string Department,
    [Required, MaxLength(50)] string Position,
    [Range(0, 1000000)] decimal Salary,
    DateTime DateOfJoining,
    bool IsActive = true,
    string? AvatarUrl = null
);

public record UpdateEmployeeDto(
    [Required, MaxLength(50)] string FirstName,
    [Required, MaxLength(50)] string LastName,
    [Required, EmailAddress, MaxLength(100)] string Email,
    [Phone, MaxLength(20)] string Phone,
    [Required, MaxLength(50)] string Department,
    [Required, MaxLength(50)] string Position,
    [Range(0, 1000000)] decimal Salary,
    DateTime DateOfJoining,
    bool IsActive,
    string? AvatarUrl = null
);

public record EmployeeQueryParams(
    string? Search = null,
    string? Department = null,
    bool? IsActive = null,
    string? SortBy = "name",
    bool SortDescending = false,
    int Page = 1,
    int PageSize = 10
);

public record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record EmployeeStatsDto(
    int TotalEmployees,
    int ActiveEmployees,
    int InactiveEmployees,
    decimal AverageSalary,
    int DepartmentCount,
    IEnumerable<DepartmentStatDto> Departments
);

public record DepartmentStatDto(
    string Name,
    int EmployeeCount
);
