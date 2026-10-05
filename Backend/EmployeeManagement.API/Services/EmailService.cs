using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace EmployeeManagement.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string body)
    {
        var senderEmail = _configuration["EmailSettings:Email"];
        var password = _configuration["EmailSettings:Password"];
        var host = _configuration["EmailSettings:Host"];
        var portValue = _configuration["EmailSettings:Port"];

        // Validate email configuration
        if (string.IsNullOrWhiteSpace(senderEmail))
        {
            throw new InvalidOperationException(
                "EmailSettings:Email is not configured."
            );
        }

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "EmailSettings:Password is not configured."
            );
        }

        if (string.IsNullOrWhiteSpace(host))
        {
            throw new InvalidOperationException(
                "EmailSettings:Host is not configured."
            );
        }

        if (!int.TryParse(portValue, out var port))
        {
            throw new InvalidOperationException(
                "EmailSettings:Port is not configured correctly."
            );
        }

        // Create email
        var email = new MimeMessage();

        email.From.Add(
            new MailboxAddress(
                "Employee Management",
                senderEmail
            )
        );

        email.To.Add(
            MailboxAddress.Parse(toEmail)
        );

        email.Subject = subject;

        email.Body = new BodyBuilder
        {
            HtmlBody = body
        }.ToMessageBody();

        using var smtp = new SmtpClient();

        try
        {
            // Connect to SMTP server
            await smtp.ConnectAsync(
                host,
                port,
                SecureSocketOptions.StartTls
            );

            // Temporary diagnostic information
            // Password itself is NEVER printed.
            Console.WriteLine($"SMTP Email: {senderEmail}");
            Console.WriteLine($"SMTP Host: {host}");
            Console.WriteLine($"SMTP Port: {port}");
            Console.WriteLine(
                $"SMTP Password Loaded: {!string.IsNullOrWhiteSpace(password)}"
            );
            Console.WriteLine(
                $"SMTP Password Length: {password.Length}"
            );

            // Authenticate with Gmail
            await smtp.AuthenticateAsync(
                senderEmail,
                password
            );

            // Send email
            await smtp.SendAsync(email);

            // Disconnect
            await smtp.DisconnectAsync(true);

            Console.WriteLine(
                $"Password reset email sent successfully to {toEmail}"
            );
        }
        catch (Exception ex)
        {
            if (smtp.IsConnected)
            {
                await smtp.DisconnectAsync(true);
            }

            throw new Exception(
                $"Failed to send email. SMTP error: {ex.Message}",
                ex
            );
        }
    }
}