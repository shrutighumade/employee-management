using EmployeeManagement.API.Controllers;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace EmployeeManagement.Tests;

public class DepartmentsControllerTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetDepartments_ReturnsPaginatedList_WithCorrectMetadata()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        context.Departments.AddRange(
            new Department { Name = "Engineering", Description = "Dev team", Location = "Pune" },
            new Department { Name = "HR", Description = "Human resources", Location = "Mumbai" },
            new Department { Name = "Finance", Description = "Accounts", Location = "Delhi" },
            new Department { Name = "Marketing", Description = "Marketing team", Location = "Bangalore" },
            new Department { Name = "Sales", Description = "Sales team", Location = "Chennai" },
            new Department { Name = "Support", Description = "Customer support", Location = "Hyderabad" }
        );
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);

        // Act
        var actionResult = await controller.GetDepartments(page: 1, pageSize: 5);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<PaginatedResponse<DepartmentResponseDto>>(okResult.Value);

        Assert.Equal(5, response.Items.Count);
        Assert.Equal(6, response.TotalCount);
        Assert.Equal(1, response.Page);
        Assert.Equal(2, response.TotalPages);
    }

    [Fact]
    public async Task GetDepartments_WithSearch_FiltersByName()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        context.Departments.AddRange(
            new Department { Name = "Engineering", Description = "", Location = "Pune" },
            new Department { Name = "HR", Description = "", Location = "Mumbai" }
        );
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);

        // Act
        var actionResult = await controller.GetDepartments(page: 1, pageSize: 5, search: "Eng");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<PaginatedResponse<DepartmentResponseDto>>(okResult.Value);

        Assert.Single(response.Items);
        Assert.Equal("Engineering", response.Items[0].Name);
    }

    [Fact]
    public async Task GetDepartment_ReturnsDepartment_WhenIdExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = new Department { Name = "Engineering", Description = "Dev team", Location = "Pune" };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);

        // Act
        var actionResult = await controller.GetDepartment(dept.Id);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var result = Assert.IsType<DepartmentResponseDto>(okResult.Value);
        Assert.Equal("Engineering", result.Name);
    }

    [Fact]
    public async Task GetDepartment_ReturnsNotFound_WhenIdDoesNotExist()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new DepartmentsController(context);

        // Act
        var actionResult = await controller.GetDepartment(999);

        // Assert
        Assert.IsType<NotFoundObjectResult>(actionResult.Result);
    }

    [Fact]
    public async Task CreateDepartment_AddsDepartment_AndReturnsCreatedResult()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new DepartmentsController(context);
        var dto = new CreateDepartmentDto
        {
            Name = "Engineering",
            Description = "Dev team",
            Location = "Pune"
        };

        // Act
        var actionResult = await controller.CreateDepartment(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        var created = Assert.IsType<DepartmentResponseDto>(createdResult.Value);

        Assert.Equal("Engineering", created.Name);
        Assert.Equal(1, await context.Departments.CountAsync());
    }

    [Fact]
    public async Task CreateDepartment_ReturnsConflict_WhenNameAlreadyExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        context.Departments.Add(new Department { Name = "Engineering", Description = "", Location = "" });
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);
        var dto = new CreateDepartmentDto { Name = "Engineering", Description = "", Location = "" };

        // Act
        var actionResult = await controller.CreateDepartment(dto);

        // Assert
        Assert.IsType<ConflictObjectResult>(actionResult.Result);
    }

    [Fact]
    public async Task UpdateDepartment_ModifiesDepartment_WhenIdExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = new Department { Name = "Engineering", Description = "Old desc", Location = "Pune" };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);
        var dto = new UpdateDepartmentDto
        {
            Name = "Software Engineering",
            Description = "Updated description",
            Location = "Bangalore"
        };

        // Act
        var result = await controller.UpdateDepartment(dept.Id, dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var updated = Assert.IsType<DepartmentResponseDto>(okResult.Value);
        Assert.Equal("Software Engineering", updated.Name);
        Assert.Equal("Bangalore", updated.Location);
    }

    [Fact]
    public async Task UpdateDepartment_ReturnsNotFound_WhenIdDoesNotExist()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var controller = new DepartmentsController(context);
        var dto = new UpdateDepartmentDto { Name = "X", Description = "", Location = "" };

        // Act
        var result = await controller.UpdateDepartment(999, dto);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task DeleteDepartment_RemovesDepartment_WhenNoneEmployeesAssigned()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = new Department { Name = "Engineering", Description = "", Location = "" };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);

        // Act
        var result = await controller.DeleteDepartment(dept.Id);

        // Assert
        Assert.IsType<OkObjectResult>(result);
        Assert.Equal(0, await context.Departments.CountAsync());
    }

    [Fact]
    public async Task DeleteDepartment_ReturnsBadRequest_WhenEmployeesAreAssigned()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = new Department { Name = "Engineering", Description = "", Location = "" };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        context.Employees.Add(new Employee
        {
            Name = "Alice",
            EmployeeId = 1,
            EmployeeSalary = 50000,
            LeavesCount = 10,
            JoiningDate = "2024-01-01",
            DateOfBirth = "1995-01-01",
            PhoneNumber = "9000000000",
            DepartmentId = dept.Id
        });
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);

        // Act
        var result = await controller.DeleteDepartment(dept.Id);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(1, await context.Departments.CountAsync());
    }

    [Fact]
    public async Task GetDepartment_ReturnsCorrectEmployeeCount()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var dept = new Department { Name = "Engineering", Description = "", Location = "" };
        context.Departments.Add(dept);
        await context.SaveChangesAsync();

        context.Employees.AddRange(
            new Employee { Name = "Alice", EmployeeId = 1, EmployeeSalary = 50000, LeavesCount = 10, JoiningDate = "2024-01-01", DateOfBirth = "1995-01-01", PhoneNumber = "9000000001", DepartmentId = dept.Id },
            new Employee { Name = "Bob", EmployeeId = 2, EmployeeSalary = 55000, LeavesCount = 12, JoiningDate = "2024-02-01", DateOfBirth = "1993-05-10", PhoneNumber = "9000000002", DepartmentId = dept.Id }
        );
        await context.SaveChangesAsync();

        var controller = new DepartmentsController(context);

        // Act
        var actionResult = await controller.GetDepartment(dept.Id);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var result = Assert.IsType<DepartmentResponseDto>(okResult.Value);
        Assert.Equal(2, result.EmployeeCount);
    }
}
