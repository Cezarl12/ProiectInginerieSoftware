using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Infrastructure.Data;
using SportMap.Infrastructure.Email;
using SportMap.Infrastructure.Repositories;
using SportMap.Infrastructure.Security;

namespace SportMap.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<SportMapDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.Configure<EmailSettings>(configuration.GetSection("Email"));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IActivityRepository, ActivityRepository>();
        services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IEmailService, SmtpEmailService>();

        return services;
    }
}
