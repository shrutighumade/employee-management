using EmployeeManagement.API.DTOs;

namespace EmployeeManagement.API.Services;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest request);

    Task<string> LoginAsync(LoginRequest request);

    Task<string> ForgotPasswordAsync(ForgotPasswordRequest request);

    Task<string> ResetPasswordAsync(ResetPasswordRequest request);
}