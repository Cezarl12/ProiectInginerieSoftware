using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;

namespace SportMap.Infrastructure.Data;

public class SportMapDbContext : DbContext
{
    public SportMapDbContext(DbContextOptions<SportMapDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(u => u.ProfilePhotoUrl).HasMaxLength(255);
            entity.Property(u => u.FavoriteSports).HasMaxLength(255);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
