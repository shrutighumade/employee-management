using EmployeeManagement.API.DTOs;

namespace EmployeeManagement.API.Services;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);
}