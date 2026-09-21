using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Register AppDbContext with PostgreSQL provider
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseInMemoryDatabase("EmployeeDb");
    }
});

// Register Application Services
builder.Services.AddScoped<IEmployeeService, EmployeeService>();

// Configure CORS for Angular Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200", "http://localhost:4201")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Ensure Database & Tables are created and seed data is populated
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        context.Database.Migrate();
        AppDbContext.SeedData(context);
        Console.WriteLine("[Database Success] Connected to PostgreSQL server and applied migrations successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Database Note] PostgreSQL connection unavailable ({ex.Message}). Using InMemory database for development.");
        
        // Re-configure in-memory database fallback if PostgreSQL service is offline
        var inMemoryOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("EmployeeDb")
            .Options;
            
        using var inMemoryContext = new AppDbContext(inMemoryOptions);
        AppDbContext.SeedData(inMemoryContext);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();
