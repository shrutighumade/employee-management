namespace EmployeeManagement.API.Models;

public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public decimal EmployeeSalary { get; set; }
    public int LeavesCount { get; set; }
    public string JoiningDate { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
