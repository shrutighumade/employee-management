using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Employee> Employees => Set<Employee>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Email).IsUnique();
        });
    }

    public static void SeedData(AppDbContext context)
    {
        if (context.Employees.Any()) return;

        var employees = new List<Employee>
        {
            new()
            {
                Id = 1,
                FirstName = "Sarah",
                LastName = "Jenkins",
                Email = "sarah.jenkins@company.com",
                Phone = "+1 (555) 234-5678",
                Department = "Engineering",
                Position = "Senior Frontend Developer",
                Salary = 115000,
                DateOfJoining = new DateTime(2022, 3, 15),
                IsActive = true,
                AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 2,
                FirstName = "Michael",
                LastName = "Chen",
                Email = "michael.chen@company.com",
                Phone = "+1 (555) 345-6789",
                Department = "Engineering",
                Position = "Tech Lead & Architect",
                Salary = 135000,
                DateOfJoining = new DateTime(2021, 6, 1),
                IsActive = true,
                AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 3,
                FirstName = "Emily",
                LastName = "Rodriguez",
                Email = "emily.rodriguez@company.com",
                Phone = "+1 (555) 456-7890",
                Department = "Human Resources",
                Position = "HR Manager",
                Salary = 92000,
                DateOfJoining = new DateTime(2020, 11, 10),
                IsActive = true,
                AvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 4,
                FirstName = "David",
                LastName = "Kim",
                Email = "david.kim@company.com",
                Phone = "+1 (555) 567-8901",
                Department = "Product",
                Position = "Senior Product Manager",
                Salary = 125000,
                DateOfJoining = new DateTime(2023, 1, 20),
                IsActive = true,
                AvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 5,
                FirstName = "Jessica",
                LastName = "Taylor",
                Email = "jessica.taylor@company.com",
                Phone = "+1 (555) 678-9012",
                Department = "Design",
                Position = "Lead UX/UI Designer",
                Salary = 105000,
                DateOfJoining = new DateTime(2022, 8, 14),
                IsActive = true,
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 6,
                FirstName = "Alexander",
                LastName = "Wright",
                Email = "alexander.wright@company.com",
                Phone = "+1 (555) 789-0123",
                Department = "Finance",
                Position = "Financial Analyst",
                Salary = 88000,
                DateOfJoining = new DateTime(2023, 5, 4),
                IsActive = false,
                AvatarUrl = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = 7,
                FirstName = "Olivia",
                LastName = "Martinez",
                Email = "olivia.martinez@company.com",
                Phone = "+1 (555) 890-1234",
                Department = "Marketing",
                Position = "Marketing Strategist",
                Salary = 85000,
                DateOfJoining = new DateTime(2024, 2, 1),
                IsActive = true,
                AvatarUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        context.Employees.AddRange(employees);
        context.SaveChanges();
    }
}
