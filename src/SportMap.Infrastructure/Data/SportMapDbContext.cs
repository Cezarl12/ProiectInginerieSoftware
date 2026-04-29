using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Models.Enums;

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
            entity.Property(l => l.Status).HasDefaultValue(LocationStatus.Pending);
            entity.Property(l => l.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });

        modelBuilder.Entity<Activity>(entity =>
        {
            entity.ToTable("Activities");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Title).IsRequired().HasMaxLength(100);
            entity.Property(a => a.Sport).IsRequired().HasMaxLength(50);
            entity.Property(a => a.Type).HasConversion<int>();
            entity.Property(a => a.Description).HasMaxLength(500);
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

        modelBuilder.Entity<Location>().HasData(
            new Location { Id = 1,  Name = "Stadionul Municipal Iuliu Bodola",  Address = "Str. General Magheru 1, Oradea",    Latitude = 47.0511, Longitude = 21.9239, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 2,  Name = "Baza Olimpică de Natație Oradea",   Address = "Str. Politehnicii 1, Oradea",       Latitude = 47.0628, Longitude = 21.9113, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 3,  Name = "Pista de Ciclism Parcul Brătianu",  Address = "Calea Bihorului 100, Oradea",       Latitude = 47.0551, Longitude = 21.9331, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 4,  Name = "Complexul de Tenis Lotus",           Address = "Calea Sântandrei 77, Oradea",       Latitude = 47.0712, Longitude = 21.9287, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 5,  Name = "XT Gold Arena",                      Address = "Calea Borșului 35, Oradea",         Latitude = 47.0621, Longitude = 21.9073, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 6,  Name = "Sala de Sport a Universității",      Address = "Str. Universității 1, Oradea",      Latitude = 47.0469, Longitude = 21.9332, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 7,  Name = "Pista de Atletism Iuliu Bodola",     Address = "Str. General Magheru 1, Oradea",    Latitude = 47.0512, Longitude = 21.9241, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 8,  Name = "Sala Sporturilor Oradea",            Address = "Str. Menumorut 3, Oradea",          Latitude = 47.0521, Longitude = 21.9201, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 9,  Name = "Centrul Fitness SportMap Park",       Address = "Piața Unirii 4, Oradea",            Latitude = 47.0478, Longitude = 21.9194, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Location { Id = 10, Name = "Sala de Box Crișul",                 Address = "Str. Republicii 22, Oradea",        Latitude = 47.0465, Longitude = 21.9189, Status = LocationStatus.Approved, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        base.OnModelCreating(modelBuilder);
    }
}
