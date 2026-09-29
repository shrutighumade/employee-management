namespace EmployeeManagement.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int EmployeId { get; set; }
    public decimal EmployeSalary { get; set; }
    public int LeavesCount { get; set; }
    public string JoingDate { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
