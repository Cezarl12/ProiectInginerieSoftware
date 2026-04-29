using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;

namespace SportMap.Infrastructure.Data;

public class SportMapDbContext : DbContext
{
    public SportMapDbContext(DbContextOptions<SportMapDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Activity> Activities => Set<Activity>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Participation> Participations => Set<Participation>();

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
            entity.Property(u => u.RefreshToken).HasMaxLength(512);
            entity.Property(u => u.IsEmailConfirmed).HasDefaultValue(false);
            entity.Property(u => u.EmailConfirmationToken).HasMaxLength(64);

            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.ToTable("Locations");
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Name).IsRequired().HasMaxLength(200);
            entity.Property(l => l.Address).IsRequired().HasMaxLength(400);
            entity.Property(l => l.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });

        modelBuilder.Entity<Activity>(entity =>
        {
            entity.ToTable("Activities");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).IsRequired().HasMaxLength(200);
            entity.Property(a => a.Sport).IsRequired().HasMaxLength(100);
            entity.Property(a => a.Type).IsRequired().HasMaxLength(20);
            entity.Property(a => a.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(a => a.Organizer)
                  .WithMany(u => u.OrganizedActivities)
                  .HasForeignKey(a => a.OrganizerId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Location)
                  .WithMany(l => l.Activities)
                  .HasForeignKey(a => a.LocationId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Participation>(entity =>
        {
            entity.ToTable("Participations");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.JoinedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(p => p.Activity)
                  .WithMany(a => a.Participations)
                  .HasForeignKey(p => p.ActivityId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(p => p.User)
                  .WithMany(u => u.Participations)
                  .HasForeignKey(p => p.UserId)
                  .OnDelete(DeleteBehavior.NoAction);

            entity.HasIndex(p => new { p.ActivityId, p.UserId }).IsUnique();
        });

        base.OnModelCreating(modelBuilder);
    }
}
