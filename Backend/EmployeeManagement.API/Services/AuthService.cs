using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EmployeeManagement.API.Data;
using EmployeeManagement.API.DTOs;
using EmployeeManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;


namespace EmployeeManagement.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    public AuthService(
     AppDbContext context,
     IConfiguration configuration,
     IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<string> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (existingUser != null)
        {
            return "Email already registered.";
        }

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Employee",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return "Registration successful.";
    }

    public async Task<string> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null)
        {
            return "Invalid email or password.";
        }

        if (!user.IsActive)
        {
            return "User account is inactive.";
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash
        );

        if (!passwordValid)
        {
            return "Invalid email or password.";
        }

        var jwtSettings = _configuration.GetSection("Jwt");

        var key = jwtSettings["Key"];

        if (string.IsNullOrEmpty(key))
        {
            throw new InvalidOperationException(
                "JWT Key is not configured."
            );
        }

        var claims = new[]
        {
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()
            ),

            new Claim(
                JwtRegisteredClaimNames.Email,
                user.Email
            ),

            new Claim(
                ClaimTypes.Name,
                $"{user.FirstName} {user.LastName}"
            ),

            new Claim(
                ClaimTypes.Role,
                user.Role
            )
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var expiryMinutes = int.Parse(
            jwtSettings["ExpiryMinutes"] ?? "60"
        );

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }

    public async Task<string> ForgotPasswordAsync(
     ForgotPasswordRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null)
        {
            return "If the email is registered, a password reset link will be sent.";
        }

        // Generate a secure random token
        var tokenBytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(32);

        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        // Save reset token
        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30),
            IsUsed = false
        };

        _context.PasswordResetTokens.Add(resetToken);

        await _context.SaveChangesAsync();

        // Create frontend reset link
        var resetLink =
            $"http://localhost:4200/reset-password?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(token)}";

        // Prepare email
        var subject = "Employee Management - Password Reset";

        var body = $@"
        <html>
        <body style='font-family: Arial, sans-serif;'>
            <h2>Password Reset Request</h2>

            <p>Hello {System.Net.WebUtility.HtmlEncode(user.FirstName)},</p>

            <p>We received a request to reset your password.</p>

            <p>Click the button below to reset your password:</p>

            <a href='{resetLink}'
               style='background-color:#2563eb;
                      color:white;
                      padding:12px 20px;
                      text-decoration:none;
                      border-radius:5px;
                      display:inline-block;'>
                Reset Password
            </a>

            <p>This link expires in 30 minutes.</p>

            <p>If you did not request a password reset, please ignore this email.</p>

            <br>
            <p>Regards,<br>Employee Management Team</p>
        </body>
        </html>";

        // Actually send email
        await _emailService.SendEmailAsync(
            user.Email,
            subject,
            body
        );

        return "Password reset email sent successfully. Please check your inbox.";
    }
}