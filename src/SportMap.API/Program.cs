using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Events;
using SportMap.API.Middleware;
using SportMap.API.Swagger;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Core.Services;
using SportMap.Infrastructure;
using SportMap.Infrastructure.Data;
using SportMap.Infrastructure.Email;
using SportMap.Infrastructure.Security;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/sportmap-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

// ---------- Services ----------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Infrastructure layer (DbContext, repositories, BCrypt, JWT generator)
builder.Services.AddInfrastructure(builder.Configuration);

// Core services (business logic)
builder.Services.AddScoped<IAuthService>(sp => new AuthService(
    sp.GetRequiredService<IUserRepository>(),
    sp.GetRequiredService<IPasswordHasher>(),
    sp.GetRequiredService<IJwtTokenGenerator>(),
    sp.GetRequiredService<IEmailService>(),
    builder.Configuration["App:BaseUrl"] ?? "http://localhost:5000"));
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IActivityService, ActivityService>();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IParticipationService, ParticipationService>();
builder.Services.AddScoped<IFriendshipService, FriendshipService>();

// JWT authentication
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = JwtRegisteredClaimNames.Sub,
            RoleClaimType = ClaimTypes.Role
        };
    });

builder.Services.AddAuthorization();

// CORS for the Angular client
builder.Services.AddCors(options =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                  ?? new[] { "http://localhost:4200" };
    options.AddPolicy("AngularClient", policy =>
        policy.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader());
});

// ---------- Swagger ----------
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SportMap API",
        Version = "v1",
        Description =
            "**SportMap** — platformă multi-sport pentru descoperirea locațiilor, " +
            "activităților și comunităților sportive.\n\n" +
            "## Cum te autentifici\n" +
            "1. Înregistrează-te via `POST /api/auth/register`\n" +
            "2. Confirmă email-ul via link-ul primit\n" +
            "3. Autentifică-te via `POST /api/auth/login` — primești `token` (JWT) și `refreshToken`\n" +
            "4. Apasă butonul **Authorize 🔒** (sus-dreapta) și lipește **doar token-ul** (fără prefixul `Bearer `)",
        Contact = new OpenApiContact { Name = "SportMap", Email = "cezar.lauran15@gmail.com" }
    });

    // HTTP Bearer — UI cere direct token-ul, fără prefixul "Bearer "
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Lipește token-ul JWT obținut de la `POST /api/auth/login` (fără prefixul `Bearer `)."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    // XML comments from API and Models assemblies
    foreach (var xmlFile in new[] { "SportMap.API.xml", "SportMap.Models.xml" })
    {
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }

    c.EnableAnnotations();
    c.DocumentFilter<TagDescriptionsDocumentFilter>();

    // Sort: by controller name, then GET → POST → PUT → PATCH → DELETE
    c.OrderActionsBy(api =>
    {
        var verbOrder = api.HttpMethod?.ToUpper() switch
        {
            "GET"    => "1",
            "POST"   => "2",
            "PUT"    => "3",
            "PATCH"  => "4",
            "DELETE" => "5",
            _        => "6"
        };
        return $"{api.ActionDescriptor.RouteValues["controller"]}_{verbOrder}_{api.RelativePath}";
    });
});

var app = builder.Build();

// ---------- Startup: migrations + seeder ----------
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SportMapDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await context.Database.MigrateAsync();
    await DbSeeder.SeedAdminAsync(context, hasher);
}

// ---------- Pipeline ----------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SportMap API v1");
        c.DocumentTitle = "SportMap API";
        c.DefaultModelsExpandDepth(-1);
        c.EnableFilter();
        c.EnableDeepLinking();
        c.DisplayRequestDuration();
    });
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AngularClient");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// expose the Program class for integration tests
public partial class Program { }
