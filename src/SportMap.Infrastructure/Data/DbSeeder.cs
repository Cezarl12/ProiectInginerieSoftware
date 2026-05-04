using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Services;

namespace SportMap.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(SportMapDbContext context, IPasswordHasher hasher)
    {
        if (context.Users.Any(u => u.Role == UserRole.Admin))
            return;

        context.Users.Add(new User
        {
            Username = "admin",
            Email = "admin@sportmap.local",
            PasswordHash = hasher.Hash("Admin123!"),
            Role = UserRole.Admin,
            IsEmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        });

        await context.SaveChangesAsync();
    }
}
