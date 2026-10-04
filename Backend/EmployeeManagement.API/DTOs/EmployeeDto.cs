namespace EmployeeManagement.API.DTOs;

public class CreateEmployeeDto
{
    public string Name { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public decimal EmployeeSalary { get; set; }
    public int LeavesCount { get; set; }
    public string JoiningDate { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
}

public class UpdateEmployeeDto
{
    public string Name { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public decimal EmployeeSalary { get; set; }
    public int LeavesCount { get; set; }
    public string JoiningDate { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
