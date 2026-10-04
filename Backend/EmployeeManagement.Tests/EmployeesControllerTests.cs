using EmployeeManagement.API.Controllers;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace EmployeeManagement.Tests;

public class EmployeesControllerTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private Department SeedDepartment(AppDbContext context, string name = "Engineering")
    {
        var dept = new Department { Name = name, Description = "", Location = "" };
        context.Departments.Add(dept);
        context.SaveChanges();
        return dept;
    }

    [Fact]
    public async Task GetEmployees_ReturnsPaginatedList_WithCorrectItemsAndMetadata()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = SeedDepartment(context);

        context.Employees.AddRange(
            new Employee { Name = "Emp 1", EmployeeId = 101, EmployeeSalary = 30000, LeavesCount = 10, JoiningDate = "2024-01-01", DateOfBirth = "2000-01-01", PhoneNumber = "1000000001", DepartmentId = dept.Id },
            new Employee { Name = "Emp 2", EmployeeId = 102, EmployeeSalary = 35000, LeavesCount = 12, JoiningDate = "2024-01-02", DateOfBirth = "2000-01-02", PhoneNumber = "1000000002", DepartmentId = dept.Id },
            new Employee { Name = "Emp 3", EmployeeId = 103, EmployeeSalary = 40000, LeavesCount = 14, JoiningDate = "2024-01-03", DateOfBirth = "2000-01-03", PhoneNumber = "1000000003", DepartmentId = dept.Id },
            new Employee { Name = "Emp 4", EmployeeId = 104, EmployeeSalary = 45000, LeavesCount = 16, JoiningDate = "2024-01-04", DateOfBirth = "2000-01-04", PhoneNumber = "1000000004", DepartmentId = dept.Id },
            new Employee { Name = "Emp 5", EmployeeId = 105, EmployeeSalary = 50000, LeavesCount = 18, JoiningDate = "2024-01-05", DateOfBirth = "2000-01-05", PhoneNumber = "1000000005", DepartmentId = dept.Id },
            new Employee { Name = "Emp 6", EmployeeId = 106, EmployeeSalary = 55000, LeavesCount = 20, JoiningDate = "2024-01-06", DateOfBirth = "2000-01-06", PhoneNumber = "1000000006", DepartmentId = dept.Id }
        );
        await context.SaveChangesAsync();

        var controller = new EmployeesController(context);

        // Act (Page 1, max 5 items per page)
        var actionResult = await controller.GetEmployees(page: 1, pageSize: 5);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<PaginatedResponse<Employee>>(okResult.Value);

        Assert.Equal(5, response.Items.Count);
        Assert.Equal(6, response.TotalCount);
        Assert.Equal(1, response.Page);
        Assert.Equal(5, response.PageSize);
        Assert.Equal(2, response.TotalPages);
    }

    [Fact]
    public async Task GetEmployees_WithSearch_FiltersResults()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = SeedDepartment(context);

        context.Employees.AddRange(
            new Employee { Name = "Alice Johnson", EmployeeId = 201, EmployeeSalary = 45000, LeavesCount = 15, JoiningDate = "2023-05-10", DateOfBirth = "1995-02-10", PhoneNumber = "9876543210", DepartmentId = dept.Id },
            new Employee { Name = "Bob Smith", EmployeeId = 202, EmployeeSalary = 50000, LeavesCount = 10, JoiningDate = "2022-03-15", DateOfBirth = "1992-08-20", PhoneNumber = "9123456780", DepartmentId = dept.Id }
        );
        await context.SaveChangesAsync();

        var controller = new EmployeesController(context);

        // Act
        var actionResult = await controller.GetEmployees(page: 1, pageSize: 5, search: "Alice");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<PaginatedResponse<Employee>>(okResult.Value);

        Assert.Single(response.Items);
        Assert.Equal("Alice Johnson", response.Items[0].Name);
    }

    [Fact]
    public async Task GetEmployee_ReturnsEmployee_WhenIdExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = SeedDepartment(context);
        var employee = new Employee { Name = "Charlie", EmployeeId = 301, EmployeeSalary = 60000, LeavesCount = 20, JoiningDate = "2024-02-01", DateOfBirth = "1990-01-01", PhoneNumber = "9998887770", DepartmentId = dept.Id };
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var controller = new EmployeesController(context);

        // Act
        var actionResult = await controller.GetEmployee(employee.Id);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var returnedEmployee = Assert.IsType<Employee>(okResult.Value);
        Assert.Equal("Charlie", returnedEmployee.Name);
    }

    [Fact]
    public async Task GetEmployee_ReturnsNotFound_WhenIdDoesNotExist()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new EmployeesController(context);

        // Act
        var actionResult = await controller.GetEmployee(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(actionResult.Result);
    }

    [Fact]
    public async Task CreateEmployee_AddsEmployeeToDatabase_AndReturnsCreatedResult()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = SeedDepartment(context);
        var controller = new EmployeesController(context);
        var dto = new CreateEmployeeDto
        {
            Name = "David Warner",
            EmployeeId = 401,
            EmployeeSalary = 75000,
            LeavesCount = 18,
            JoiningDate = "2024-06-01",
            DateOfBirth = "1988-10-27",
            PhoneNumber = "9876543212",
            DepartmentId = dept.Id
        };

        // Act
        var actionResult = await controller.CreateEmployee(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        var createdEmp = Assert.IsType<Employee>(createdResult.Value);

        Assert.Equal("David Warner", createdEmp.Name);
        Assert.Equal(1, await context.Employees.CountAsync());
    }

    [Fact]
    public async Task UpdateEmployee_ModifiesEmployeeRecord_WhenIdExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = SeedDepartment(context);
        var employee = new Employee { Name = "Eve", EmployeeId = 501, EmployeeSalary = 50000, LeavesCount = 12, JoiningDate = "2023-01-01", DateOfBirth = "1996-04-04", PhoneNumber = "9000000001", DepartmentId = dept.Id };
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var controller = new EmployeesController(context);
        var updateDto = new UpdateEmployeeDto
        {
            Name = "Eve Updated",
            EmployeeId = 501,
            EmployeeSalary = 55000,
            LeavesCount = 15,
            JoiningDate = "2023-01-01",
            DateOfBirth = "1996-04-04",
            PhoneNumber = "9000000001",
            DepartmentId = dept.Id
        };

        // Act
        var result = await controller.UpdateEmployee(employee.Id, updateDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var updatedEmp = Assert.IsType<Employee>(okResult.Value);
        Assert.Equal("Eve Updated", updatedEmp.Name);
        Assert.Equal(55000, updatedEmp.EmployeeSalary);
    }

    [Fact]
    public async Task DeleteEmployee_RemovesEmployee_WhenIdExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = SeedDepartment(context);
        var employee = new Employee { Name = "Frank", EmployeeId = 601, EmployeeSalary = 40000, LeavesCount = 10, JoiningDate = "2024-03-01", DateOfBirth = "1997-07-07", PhoneNumber = "9111111111", DepartmentId = dept.Id };
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var controller = new EmployeesController(context);

        // Act
        var result = await controller.DeleteEmployee(employee.Id);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(0, await context.Employees.CountAsync());
    }
}
