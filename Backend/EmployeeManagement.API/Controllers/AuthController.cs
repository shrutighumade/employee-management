using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);

        if (result == "Email already registered.")
        {
            return BadRequest(new
            {
                message = result
            });
        }

        return Ok(new
        {
            message = result
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (result == "Invalid email or password.")
        {
            return Unauthorized(new
            {
                message = result
            });
        }

        if (result == "User account is inactive.")
        {
            return BadRequest(new
            {
                message = result
            });
        }

        return Ok(new
        {
            message = "Login successful.",
            token = result
        });
    }

    [Authorize]
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        return Ok(new
        {
            message = "You are authorized.",
            user = User.Identity?.Name,
            email = User.FindFirst("email")?.Value,
            role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var result = await _authService.ForgotPasswordAsync(request);

        return Ok(new
        {
            message = result
        });
    }
}