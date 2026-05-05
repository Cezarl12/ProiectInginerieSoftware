using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.Enums;

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

    public static async Task SeedLocationsAsync(SportMapDbContext context)
    {
        if (context.Locations.Any(l => l.Name == "Arena Națională"))
            return;

        var seed = DateTime.UtcNow;

        var locations = new List<Location>
        {
            new()
            {
                Name = "Arena Națională",
                Address = "Bd. Basarabia 37-39, București",
                Latitude = 44.4383m, Longitude = 26.1218m,
                Sports = "football", Surface = "grass", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/arena-nationala-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/arena-nationala-buc-2/800/500",
                    "https://picsum.photos/seed/arena-nationala-buc-3/800/500",
                    "https://picsum.photos/seed/arena-nationala-buc-4/800/500",
                },
                Details = "Arena Națională este cel mai mare stadion din România, cu o capacitate de 55.000 de locuri. Gazon sintetic de generația a 4-a, iluminat LED profesional, tribunele acoperite integral.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Parcul Izvor – Terenuri Fotbal",
                Address = "Str. Izvor 7, București",
                Latitude = 44.4283m, Longitude = 26.0908m,
                Sports = "football,running", Surface = "grass", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/parc-izvor-fotbal/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/parc-izvor-fotbal-2/800/500",
                    "https://picsum.photos/seed/parc-izvor-fotbal-3/800/500",
                },
                Details = "Terenuri de fotbal în Parcul Izvor, înconjurate de zone verzi. Două terenuri de 11 și două de 7, acces liber. Ideale pentru meciuri amicale și antrenamente.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Complexul Tenis Progresul",
                Address = "Str. Progresul 20, București",
                Latitude = 44.4120m, Longitude = 26.0836m,
                Sports = "tennis,padel", Surface = "clay", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/tenis-progresul-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/tenis-progresul-buc-2/800/500",
                    "https://picsum.photos/seed/tenis-progresul-buc-3/800/500",
                    "https://picsum.photos/seed/tenis-progresul-buc-4/800/500",
                },
                Details = "8 terenuri de tenis zgură și 4 terenuri de padel acoperite. Iluminat nocturn, vestiare moderne, restaurant. Organizăm turnee lunare pentru toate nivelele.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Bazinul Olimpic Dinamo",
                Address = "Str. Camil Ressu 5, București",
                Latitude = 44.4590m, Longitude = 26.1113m,
                Sports = "swimming", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/bazin-dinamo-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/bazin-dinamo-buc-2/800/500",
                    "https://picsum.photos/seed/bazin-dinamo-buc-3/800/500",
                },
                Details = "Bazin olimpic 50m, 8 culoare. Temperatura apei menținută la 27°C. Ideal pentru antrenamente de performanță și recreere. Bazin separat pentru copii și lecții de înot.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sala Sporturilor Floreasca",
                Address = "Bd. Floreasca 40, București",
                Latitude = 44.4560m, Longitude = 26.1044m,
                Sports = "basketball,volleyball,handball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/sala-floreasca-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/sala-floreasca-buc-2/800/500",
                    "https://picsum.photos/seed/sala-floreasca-buc-3/800/500",
                    "https://picsum.photos/seed/sala-floreasca-buc-4/800/500",
                },
                Details = "Sală polivalentă cu 3.000 locuri. Teren omologat FIBA pentru baschet și EHF pentru handbal. Gazdă pentru meciurile echipelor de club din București.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Pista de Alergare Herăstrău",
                Address = "Aleea Herăstrău 2, București",
                Latitude = 44.4659m, Longitude = 26.0900m,
                Sports = "running,cycling", Surface = "asphalt", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/herastrau-pista-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/herastrau-pista-buc-2/800/500",
                    "https://picsum.photos/seed/herastrau-pista-buc-3/800/500",
                },
                Details = "Pistă de alergare și ciclism de 3,8 km în jurul Lacului Herăstrău. Suprafață impecabilă, separată de trafic, peisaj superb. Deschisă non-stop, fără taxă de acces.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Studio Yoga & Wellness Central",
                Address = "Str. Academiei 12, București",
                Latitude = 44.4367m, Longitude = 26.1018m,
                Sports = "yoga,fitness", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/yoga-central-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/yoga-central-buc-2/800/500",
                    "https://picsum.photos/seed/yoga-central-buc-3/800/500",
                },
                Details = "Studio de yoga cu 3 săli, capacitate totală 80 de persoane. Clase de Hatha, Vinyasa, Yin și meditație. Instructori certificați internațional. Chirii pentru clase private disponibile.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Fitness Park Unirii",
                Address = "Piața Unirii 1, București",
                Latitude = 44.4318m, Longitude = 26.1025m,
                Sports = "fitness,running", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/fitness-unirii-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/fitness-unirii-buc-2/800/500",
                    "https://picsum.photos/seed/fitness-unirii-buc-3/800/500",
                },
                Details = "Sală de fitness premium cu echipamente Technogym, zone cardio și forță, saună finlandeză și infraroșu. Personal traineri disponibili. Program 06:00–23:00 zilnic.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Complexul Sportiv CSA Steaua",
                Address = "Bd. Ghencea 49, București",
                Latitude = 44.4225m, Longitude = 26.0615m,
                Sports = "football,athletics", Surface = "tartan", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/csa-steaua-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/csa-steaua-buc-2/800/500",
                    "https://picsum.photos/seed/csa-steaua-buc-3/800/500",
                    "https://picsum.photos/seed/csa-steaua-buc-4/800/500",
                },
                Details = "Complex sportiv al CSA Steaua, cu stadion de 30.000 locuri, pistă de atletism tartanică omologată IAAF și terenuri auxiliare. Acces publicului în zile fără evenimente.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sala de Box Olympia",
                Address = "Str. Olari 32, București",
                Latitude = 44.4315m, Longitude = 26.1188m,
                Sports = "boxing", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/box-olympia-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/box-olympia-buc-2/800/500",
                    "https://picsum.photos/seed/box-olympia-buc-3/800/500",
                },
                Details = "Club cu tradiție în boxul românesc. Ring omologat pentru competiții naționale, 20 de saci de antrenament, antrenori cu experiență olimpică. Clase pentru începători și avansați.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Padel Club Băneasa",
                Address = "Șos. București-Ploiești 42D, București",
                Latitude = 44.4975m, Longitude = 26.0836m,
                Sports = "padel,tennis", Surface = "artificial turf", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/padel-baneasa-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/padel-baneasa-buc-2/800/500",
                    "https://picsum.photos/seed/padel-baneasa-buc-3/800/500",
                    "https://picsum.photos/seed/padel-baneasa-buc-4/800/500",
                },
                Details = "6 terenuri de padel acoperite și 2 exterioare, toate iluminate nocturn. Echipamente de închiriat, antrenori certificați FRP. Cel mai mare club de padel din București.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Parcul Tineretului – Alee Sport",
                Address = "Bd. Tineretului 6, București",
                Latitude = 44.4132m, Longitude = 26.1024m,
                Sports = "running,yoga,fitness", Surface = "asphalt", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/parc-tineretului-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/parc-tineretului-buc-2/800/500",
                    "https://picsum.photos/seed/parc-tineretului-buc-3/800/500",
                },
                Details = "Alee de sport de 4,2 km în Parcul Tineretului, cu stații de fitness în aer liber, platforme de yoga/stretching și teren pentru calistenie. Acces liber, 24/7.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sala Arte Marțiale Dragon",
                Address = "Str. Bărăției 6, București",
                Latitude = 44.4415m, Longitude = 26.0954m,
                Sports = "martial arts,boxing", Surface = "tatami", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/martial-arts-dragon-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/martial-arts-dragon-buc-2/800/500",
                    "https://picsum.photos/seed/martial-arts-dragon-buc-3/800/500",
                },
                Details = "Club de arte marțiale cu suprafață tatami de 300mp. Discipline: Karate, Judo, BJJ, Kickboxing, MMA. Antrenori cu titluri naționale și internaționale. Grupe de vârstă 6–60+ ani.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Rugby Club Arcul de Triumf",
                Address = "Str. Aviatiei 1, București",
                Latitude = 44.4631m, Longitude = 26.0750m,
                Sports = "rugby,football", Surface = "grass", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/rugby-arcul-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/rugby-arcul-buc-2/800/500",
                    "https://picsum.photos/seed/rugby-arcul-buc-3/800/500",
                },
                Details = "Teren omologat World Rugby, gazon natural de ultimă generație. Gazda meciurilor de rugby ale echipei naționale. Acces public în sesiunile de antrenament deschis.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Volleyball Arena Colentina",
                Address = "Str. Fundeni 3, București",
                Latitude = 44.4685m, Longitude = 26.1328m,
                Sports = "volleyball,basketball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/volleyball-colentina-buc/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/volleyball-colentina-buc-2/800/500",
                    "https://picsum.photos/seed/volleyball-colentina-buc-3/800/500",
                },
                Details = "Sală modernă cu 2 terenuri de volei și un teren de baschet. Pardoseală profesională din lemn, iluminat LED, vestiare renovate. Liga amatorilor se joacă miercuri și vineri.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
        };

        context.Locations.AddRange(locations);
        await context.SaveChangesAsync();
    }
}
