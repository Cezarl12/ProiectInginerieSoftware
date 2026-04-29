using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using SportMap.Core.Entities;
using SportMap.Models.Enums;
using System.Text.Json;

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
            entity.Property(l => l.MainPhotoUrl).HasMaxLength(500);
            entity.Property(l => l.Details).HasMaxLength(1000);
            entity.Property(l => l.SecondaryPhotoUrls)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>(),
                    new ValueComparer<List<string>>(
                        (a, b) => a!.SequenceEqual(b!),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()))
                .HasColumnType("nvarchar(max)");
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

        var seed = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Location>().HasData(
            new Location
            {
                Id = 1, Name = "Stadionul Municipal Iuliu Bodola", Address = "Str. General Magheru 1, Oradea",
                Latitude = 47.0511, Longitude = 21.9239, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/stadion-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/stadion-oradea-2/800/500", "https://picsum.photos/seed/stadion-oradea-3/800/500" },
                Details = "Stadionul Municipal Iuliu Bodola este principala arenă de fotbal din Oradea, cu o capacitate de 19.000 de locuri. Dispune de teren de gazon natural, vestiare moderne și tribune acoperite.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 2, Name = "Baza Olimpică de Natație Oradea", Address = "Str. Politehnicii 1, Oradea",
                Latitude = 47.0628, Longitude = 21.9113, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/piscina-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/piscina-oradea-2/800/500", "https://picsum.photos/seed/piscina-oradea-3/800/500" },
                Details = "Bazin olimpic acoperit cu 8 culoare, lungime 50m. Ideal pentru antrenamente de înot competițional și recreațional. Dispune de bazin de sărituri și saune.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 3, Name = "Pista de Ciclism Parcul Brătianu", Address = "Calea Bihorului 100, Oradea",
                Latitude = 47.0551, Longitude = 21.9331, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/ciclism-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/ciclism-oradea-2/800/500", "https://picsum.photos/seed/ciclism-oradea-3/800/500" },
                Details = "Pistă dedicată ciclismului în Parcul Brătianu, cu o lungime de 3,5 km. Suprafață asfaltată, separată de trafic, înconjurată de vegetație. Acces liber, deschis publicului.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 4, Name = "Complexul de Tenis Lotus", Address = "Calea Sântandrei 77, Oradea",
                Latitude = 47.0712, Longitude = 21.9287, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/tenis-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/tenis-oradea-2/800/500", "https://picsum.photos/seed/tenis-oradea-3/800/500" },
                Details = "Complex cu 6 terenuri de tenis (4 zgură, 2 hard), iluminat nocturn, sală de forță și vestiare. Găzduiește turnee locale și regionale pe tot parcursul anului.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 5, Name = "XT Gold Arena", Address = "Calea Borșului 35, Oradea",
                Latitude = 47.0621, Longitude = 21.9073, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/arena-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/arena-oradea-2/800/500", "https://picsum.photos/seed/arena-oradea-3/800/500" },
                Details = "Sală polivalentă modernă cu o capacitate de 5.000 de locuri. Teren de baschet omologat FIBA, folosit pentru meciurile echipei CSM Oradea. Dispune de parcare, restaurant și magazine.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 6, Name = "Sala de Sport a Universității", Address = "Str. Universității 1, Oradea",
                Latitude = 47.0469, Longitude = 21.9332, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/sala-uni-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/sala-uni-oradea-2/800/500", "https://picsum.photos/seed/sala-uni-oradea-3/800/500" },
                Details = "Sală universitară cu terenuri de volei, baschet și badminton. Folosită pentru competiții studențești și antrenamente de club. Program extins în weekenduri.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 7, Name = "Pista de Atletism Iuliu Bodola", Address = "Str. General Magheru 1, Oradea",
                Latitude = 47.0512, Longitude = 21.9241, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/atletism-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/atletism-oradea-2/800/500", "https://picsum.photos/seed/atletism-oradea-3/800/500" },
                Details = "Pistă de atletism cu 8 culoare, suprafață tartan omologată IAAF. Include sectoare pentru sărituri în lungime, înălțime și aruncări. Deschisă publicului în afara competițiilor.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 8, Name = "Sala Sporturilor Oradea", Address = "Str. Menumorut 3, Oradea",
                Latitude = 47.0521, Longitude = 21.9201, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/sala-sport-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/sala-sport-oradea-2/800/500", "https://picsum.photos/seed/sala-sport-oradea-3/800/500" },
                Details = "Sală cu capacitate de 2.500 locuri, dedicată handbalului și altor sporturi de sală. Teren omologat EHF, iluminat profesional și sistem de sonorizare.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 9, Name = "Centrul Fitness SportMap Park", Address = "Piața Unirii 4, Oradea",
                Latitude = 47.0478, Longitude = 21.9194, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/fitness-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/fitness-oradea-2/800/500", "https://picsum.photos/seed/fitness-oradea-3/800/500" },
                Details = "Centru fitness modern în inima Oradei, cu echipamente cardio și de forță de ultimă generație. Clase de grup, personal traineri certificați, saună și zone de stretching.",
                CreatedAt = seed
            },
            new Location
            {
                Id = 10, Name = "Sala de Box Crișul", Address = "Str. Republicii 22, Oradea",
                Latitude = 47.0465, Longitude = 21.9189, Status = LocationStatus.Approved,
                MainPhotoUrl = "https://picsum.photos/seed/box-oradea/800/500",
                SecondaryPhotoUrls = new List<string> { "https://picsum.photos/seed/box-oradea-2/800/500", "https://picsum.photos/seed/box-oradea-3/800/500" },
                Details = "Sala Clubului Sportiv Crișul, cu ring omologat pentru competiții naționale, saci de box, apărători și echipament complet. Antrenori cu experiență internațională.",
                CreatedAt = seed
            }
        );

        base.OnModelCreating(modelBuilder);
    }
}
