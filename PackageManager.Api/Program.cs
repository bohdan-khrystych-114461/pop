using Microsoft.EntityFrameworkCore;
using PackageManager.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=packagemanager;Username=postgres;Password=postgres";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.WebHost.UseUrls("http://0.0.0.0:5002");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
        {
            var uri = new Uri(origin);
            return uri.Host == "localhost" 
                || uri.Host == "127.0.0.1"
                || uri.Host.EndsWith(".github.io");
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        Console.WriteLine("Creating database tables...");
        db.Database.EnsureCreated();
        Console.WriteLine("Database setup completed.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database setup failed: {ex.Message}");
        throw;
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAngular");

app.MapControllers();

app.Run();
