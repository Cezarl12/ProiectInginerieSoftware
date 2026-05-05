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

    public static async Task SeedOradeaLocationsAsync(SportMapDbContext context)
    {
        if (context.Locations.Any(l => l.Name == "Stadionul Municipal Oradea"))
            return;

        var seed = DateTime.UtcNow;

        var locations = new List<Location>
        {
            new()
            {
                Name = "Stadionul Municipal Oradea",
                Address = "Str. Calea Clujului 1, Oradea",
                Latitude = 47.0701m, Longitude = 21.9082m,
                Sports = "football,athletics", Surface = "grass", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/stadion-municipal-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/stadion-municipal-oradea-2/800/500",
                    "https://picsum.photos/seed/stadion-municipal-oradea-3/800/500",
                },
                Details = "Stadion cu 20.000 locuri, gazon natural omologat UEFA. Pistă de atletism tartanică, iluminat profesional LED. Gazda meciurilor echipei FC Bihor Oradea.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Arena Antonio Alexe",
                Address = "Str. Calea Clujului 3, Oradea",
                Latitude = 47.0698m, Longitude = 21.9095m,
                Sports = "basketball,handball,volleyball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/arena-antonio-alexe/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/arena-antonio-alexe-2/800/500",
                    "https://picsum.photos/seed/arena-antonio-alexe-3/800/500",
                    "https://picsum.photos/seed/arena-antonio-alexe-4/800/500",
                },
                Details = "Sală polivalentă cu 5.000 locuri, teren omologat FIBA și EHF. Gazdă pentru CSM CSU Oradea (baschet) și CS Minaur (handbal). Parchet profesional de competiție.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Piscina Olimpică Oradea",
                Address = "Str. Dacia 1, Oradea",
                Latitude = 47.0740m, Longitude = 21.9340m,
                Sports = "swimming", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/piscina-olimpica-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/piscina-olimpica-oradea-2/800/500",
                    "https://picsum.photos/seed/piscina-olimpica-oradea-3/800/500",
                },
                Details = "Bazin olimpic 50m cu 8 culoare și bazin de sărituri. Apă la 27°C, iluminat subacvatic, tribune 1.200 locuri. Program zilnic 06:00–22:00.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Complexul Tenis Bel Air",
                Address = "Str. Oneștilor 4, Oradea",
                Latitude = 47.0795m, Longitude = 21.9155m,
                Sports = "tennis,padel", Surface = "clay", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/tenis-bel-air-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/tenis-bel-air-oradea-2/800/500",
                    "https://picsum.photos/seed/tenis-bel-air-oradea-3/800/500",
                    "https://picsum.photos/seed/tenis-bel-air-oradea-4/800/500",
                },
                Details = "10 terenuri zgură + 4 terenuri padel acoperite. Iluminat nocturn, vestiare moderne, restaurant cu terasă. Organizăm turnee lunare pentru juniori și adulți.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sala Sporturilor Universității",
                Address = "Str. Universității 1, Oradea",
                Latitude = 47.0658m, Longitude = 21.9310m,
                Sports = "volleyball,basketball,handball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/sala-universitatii-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/sala-universitatii-oradea-2/800/500",
                    "https://picsum.photos/seed/sala-universitatii-oradea-3/800/500",
                },
                Details = "Sală polivalentă a Universității din Oradea, 1.500 locuri. Teren omologat pentru competiții universitare naționale. Disponibilă și pentru cluburi sportive în afara orelor didactice.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Parcul Brătianu – Pistă Alergare",
                Address = "Bd. Dacia 10, Oradea",
                Latitude = 47.0760m, Longitude = 21.9370m,
                Sports = "running,cycling", Surface = "asphalt", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/parc-bratianu-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/parc-bratianu-oradea-2/800/500",
                    "https://picsum.photos/seed/parc-bratianu-oradea-3/800/500",
                },
                Details = "Pistă de alergare și ciclism de 2,4 km în jurul parcului. Suprafață renovată, separată de trafic, iluminat natural. Acces gratuit non-stop.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Aquapark Nymphaea",
                Address = "Str. Cantemir 1, Oradea",
                Latitude = 47.0612m, Longitude = 21.9462m,
                Sports = "swimming,fitness", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/aquapark-nymphaea-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/aquapark-nymphaea-oradea-2/800/500",
                    "https://picsum.photos/seed/aquapark-nymphaea-oradea-3/800/500",
                    "https://picsum.photos/seed/aquapark-nymphaea-oradea-4/800/500",
                },
                Details = "Complex acvatic de 8ha cu piscine termale, tobogane și bazine sportive. Apa termală la 36°C. Sală de fitness și SPA anexe. Unul dintre cele mai mari aquaparkuri din România.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Tennis Club Oradea",
                Address = "Str. Traian Moșoiu 14, Oradea",
                Latitude = 47.0722m, Longitude = 21.9180m,
                Sports = "tennis", Surface = "hard", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/tennis-club-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/tennis-club-oradea-2/800/500",
                    "https://picsum.photos/seed/tennis-club-oradea-3/800/500",
                },
                Details = "6 terenuri hard acoperite și 2 exterioare. Iluminat LED nocturn, antrenori LPF certificați. Lecții individuale și de grup pentru toate nivelele.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Bazin Ioșia",
                Address = "Str. Corneliu Coposu 5, Oradea",
                Latitude = 47.0520m, Longitude = 21.9198m,
                Sports = "swimming", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/bazin-iosia-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/bazin-iosia-oradea-2/800/500",
                    "https://picsum.photos/seed/bazin-iosia-oradea-3/800/500",
                },
                Details = "Bazin semiolimpic 25m, 6 culoare. Ideal pentru antrenamente de club și lecții de înot. Bazin separat pentru copii. Program 07:00–21:00.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Padel Arena Oradea",
                Address = "Str. Republicii 22, Oradea",
                Latitude = 47.0668m, Longitude = 21.9285m,
                Sports = "padel,tennis", Surface = "artificial turf", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/padel-arena-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/padel-arena-oradea-2/800/500",
                    "https://picsum.photos/seed/padel-arena-oradea-3/800/500",
                },
                Details = "4 terenuri padel acoperite, echipamente de închiriat, antrenori certificați WPT. Ligă amatori cu etape lunare. Rezervări online, program 07:00–23:00.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Gold's Gym Oradea",
                Address = "Bd. Magheru 10, Oradea",
                Latitude = 47.0730m, Longitude = 21.9255m,
                Sports = "fitness,yoga", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/golds-gym-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/golds-gym-oradea-2/800/500",
                    "https://picsum.photos/seed/golds-gym-oradea-3/800/500",
                },
                Details = "Sală premium 1.200mp cu echipamente Technogym, zone cardio, forță și funcțional. Clase de yoga, Pilates și HIIT incluse în abonament. Program 06:00–23:00.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Studio Yoga Lotus Oradea",
                Address = "Str. Piața Unirii 3, Oradea",
                Latitude = 47.0648m, Longitude = 21.9315m,
                Sports = "yoga,fitness", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/yoga-lotus-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/yoga-lotus-oradea-2/800/500",
                    "https://picsum.photos/seed/yoga-lotus-oradea-3/800/500",
                },
                Details = "Studio specializat cu 2 săli pentru Hatha, Vinyasa, Yin yoga și meditație. Instructori certificați Yoga Alliance. Clase online și în persoană disponibile.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Stadionul Nufărul",
                Address = "Str. Nufărului 30, Oradea",
                Latitude = 47.0840m, Longitude = 21.9380m,
                Sports = "football", Surface = "artificial turf", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/stadion-nufarul-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/stadion-nufarul-oradea-2/800/500",
                    "https://picsum.photos/seed/stadion-nufarul-oradea-3/800/500",
                },
                Details = "Stadion de cartier cu gazon sintetic generația a 4-a, 3.000 locuri. 2 terenuri de antrenament anexe. Baza echipelor de juniori din Oradea.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Boxing Club Crișana",
                Address = "Str. Primăriei 7, Oradea",
                Latitude = 47.0680m, Longitude = 21.9240m,
                Sports = "boxing", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/boxing-crisana-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/boxing-crisana-oradea-2/800/500",
                    "https://picsum.photos/seed/boxing-crisana-oradea-3/800/500",
                },
                Details = "Club cu 40 ani tradiție în boxul bihorean. Ring omologat FRB, 15 saci de antrenament, antrenori cu 3 titluri naționale. Grupe începători, avansați și performanță.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sala Arte Marțiale Dragon Oradea",
                Address = "Str. Mihai Eminescu 8, Oradea",
                Latitude = 47.0695m, Longitude = 21.9270m,
                Sports = "martial arts,boxing", Surface = "tatami", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/martial-arts-dragon-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/martial-arts-dragon-oradea-2/800/500",
                    "https://picsum.photos/seed/martial-arts-dragon-oradea-3/800/500",
                },
                Details = "250mp tatami cu discipline Karate Shotokan, Judo, BJJ și MMA. Antrenori cu centuri negre dan 4-6. Grupe de vârstă 5–60 ani, competiții naționale.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Rugby Club Oradea",
                Address = "Str. Calea Aradului 12, Oradea",
                Latitude = 47.0570m, Longitude = 21.9165m,
                Sports = "rugby,football", Surface = "grass", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/rugby-club-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/rugby-club-oradea-2/800/500",
                    "https://picsum.photos/seed/rugby-club-oradea-3/800/500",
                },
                Details = "Teren de rugby omologat World Rugby, gazon natural întreținut. Baza CSO Oradea Rugby, echipă cu tradiție în Divizia Națională. Sesiuni deschise marți și joi.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Baza Sportivă Bihorul",
                Address = "Str. Calea Bihorului 20, Oradea",
                Latitude = 47.0590m, Longitude = 21.9420m,
                Sports = "football,athletics", Surface = "tartan", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/baza-bihorul-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/baza-bihorul-oradea-2/800/500",
                    "https://picsum.photos/seed/baza-bihorul-oradea-3/800/500",
                },
                Details = "Bază cu pistă tartanică omologată, teren de fotbal și săli de forță. Centru de pregătire pentru atletismul bihorean. Antrenori cu titluri naționale la sprint și sărituri.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Termoelectrica Arena",
                Address = "Str. Decebal 2, Oradea",
                Latitude = 47.0635m, Longitude = 21.9410m,
                Sports = "basketball,volleyball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/termoelectrica-arena-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/termoelectrica-arena-oradea-2/800/500",
                    "https://picsum.photos/seed/termoelectrica-arena-oradea-3/800/500",
                    "https://picsum.photos/seed/termoelectrica-arena-oradea-4/800/500",
                },
                Details = "Sală modernă cu 2.000 locuri, parchet profesional pentru baschet și volei. Gazdă pentru meciuri de Superligă. Ligă amatori vineri seara.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Terenuri Sintetice Rogerius",
                Address = "Str. Rogerius 5, Oradea",
                Latitude = 47.0810m, Longitude = 21.9060m,
                Sports = "football", Surface = "artificial turf", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/terenuri-rogerius-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/terenuri-rogerius-oradea-2/800/500",
                    "https://picsum.photos/seed/terenuri-rogerius-oradea-3/800/500",
                },
                Details = "4 mini-terenuri sintetice (5vs5, 7vs7) cu iluminat nocturn. Tarife accesibile, rezervări pe oră. Populare pentru meciuri amicale de cartier.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Complexul Badminton Oradea",
                Address = "Str. Libertății 15, Oradea",
                Latitude = 47.0652m, Longitude = 21.9195m,
                Sports = "badminton,fitness", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/badminton-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/badminton-oradea-2/800/500",
                    "https://picsum.photos/seed/badminton-oradea-3/800/500",
                },
                Details = "8 terenuri de badminton omologate BWF, rachete și fluturași de închiriat. Club cu 200 de membri activi, turnee lunare pentru toate categoriile de vârstă.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Fitness Park Cetate",
                Address = "Str. Cetății 1, Oradea",
                Latitude = 47.0668m, Longitude = 21.9350m,
                Sports = "fitness,running", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/fitness-park-cetate-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/fitness-park-cetate-oradea-2/800/500",
                    "https://picsum.photos/seed/fitness-park-cetate-oradea-3/800/500",
                },
                Details = "Sală fitness 800mp în inima orașului, echipamente Matrix și Life Fitness. Personal traineri disponibili, clase de grup zilnice. Pistă de alergare indoor 200m.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Volleyball Club Crișul",
                Address = "Str. Ștefan cel Mare 9, Oradea",
                Latitude = 47.0710m, Longitude = 21.9395m,
                Sports = "volleyball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/volleyball-crisul-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/volleyball-crisul-oradea-2/800/500",
                    "https://picsum.photos/seed/volleyball-crisul-oradea-3/800/500",
                },
                Details = "Club de volei cu 3 terenuri omologate CEV. Echipe masculine și feminine în Divizia A2. Grupe de inițiere pentru juniori 10-18 ani, program sabat și duminică.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "CrossFit Oradea",
                Address = "Str. Traian 24, Oradea",
                Latitude = 47.0685m, Longitude = 21.9158m,
                Sports = "fitness", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/crossfit-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/crossfit-oradea-2/800/500",
                    "https://picsum.photos/seed/crossfit-oradea-3/800/500",
                },
                Details = "Box CrossFit afiliat oficial, 600mp cu bare, kettlebells, saci și platforme de sărituri. Coaches Level 2 certificați. Clase zilnice 07:00–21:00, open gym inclus.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sala Handbal Crișana",
                Address = "Str. Iuliu Maniu 18, Oradea",
                Latitude = 47.0718m, Longitude = 21.9330m,
                Sports = "handball,volleyball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/handbal-crisana-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/handbal-crisana-oradea-2/800/500",
                    "https://picsum.photos/seed/handbal-crisana-oradea-3/800/500",
                },
                Details = "Sală cu 800 locuri, teren omologat EHF pentru handbal. Echipele de handbal feminin și masculin CSM Oradea joacă aici etapele de acasă.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Ciclodrumul Oradea",
                Address = "Aleea Strandului 1, Oradea",
                Latitude = 47.0778m, Longitude = 21.9440m,
                Sports = "cycling,running", Surface = "asphalt", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/ciclodrum-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/ciclodrum-oradea-2/800/500",
                    "https://picsum.photos/seed/ciclodrum-oradea-3/800/500",
                },
                Details = "Pistă dedicată ciclismului și alergării de 5,2 km de-a lungul Crișului Repede. Acces gratuit, suprafață lisă, peisaj superb. Populară în weekenduri.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Complexul Sportiv Exact",
                Address = "Str. Calea Aradului 45, Oradea",
                Latitude = 47.0542m, Longitude = 21.9200m,
                Sports = "fitness,yoga,swimming", Surface = null, HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/exact-sport-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/exact-sport-oradea-2/800/500",
                    "https://picsum.photos/seed/exact-sport-oradea-3/800/500",
                    "https://picsum.photos/seed/exact-sport-oradea-4/800/500",
                },
                Details = "Complex complet cu sală fitness 1.000mp, bazin interior 25m, studio yoga și saună finlandeză. Abonament all-inclusive, program 06:00–23:00 zilnic.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Terenuri Fotbal Velența",
                Address = "Str. Velența 3, Oradea",
                Latitude = 47.0732m, Longitude = 21.9495m,
                Sports = "football", Surface = "grass", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/fotbal-velenta-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/fotbal-velenta-oradea-2/800/500",
                    "https://picsum.photos/seed/fotbal-velenta-oradea-3/800/500",
                },
                Details = "Două terenuri de fotbal pe gazon natural în cartierul Velența. Acces liber în afara sesiunilor de antrenament ale clubului local. Ideal pentru jocuri amicale.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sala Polivalentă CSU Oradea",
                Address = "Str. Armatei Române 5, Oradea",
                Latitude = 47.0660m, Longitude = 21.9480m,
                Sports = "basketball,volleyball,handball", Surface = "hardcourt", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/csu-oradea-sala/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/csu-oradea-sala-2/800/500",
                    "https://picsum.photos/seed/csu-oradea-sala-3/800/500",
                    "https://picsum.photos/seed/csu-oradea-sala-4/800/500",
                },
                Details = "Sala CSU Oradea, baza echipei de baschet feminin campioană a României. Parchet profesional, 3.500 locuri, iluminat LED de competiție. Liga amatorilor luni și miercuri.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Parcul Petofi – Zone Sport",
                Address = "Str. Petőfi Sándor 2, Oradea",
                Latitude = 47.0600m, Longitude = 21.9290m,
                Sports = "running,yoga,fitness", Surface = "asphalt", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/parc-petofi-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/parc-petofi-oradea-2/800/500",
                    "https://picsum.photos/seed/parc-petofi-oradea-3/800/500",
                },
                Details = "Parc central cu zone dedicate sportului: stații calistenie, platforme yoga, pistă de jogging 1,8 km. Gratuit, deschis non-stop, frecventat zilnic de sute de orădeni.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Sport Arena Oradea",
                Address = "Str. Independenței 40, Oradea",
                Latitude = 47.0752m, Longitude = 21.9130m,
                Sports = "tennis,badminton,fitness", Surface = "hard", HasLights = true,
                MainPhotoUrl = "https://picsum.photos/seed/sport-arena-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/sport-arena-oradea-2/800/500",
                    "https://picsum.photos/seed/sport-arena-oradea-3/800/500",
                    "https://picsum.photos/seed/sport-arena-oradea-4/800/500",
                },
                Details = "Centru sportiv multifuncțional: 4 terenuri tenis hard, 6 terenuri badminton, sală fitness 500mp. Rezervări online, echipamente de închiriat, cafeterie.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
            new()
            {
                Name = "Golf Club Oradea",
                Address = "Str. Calea Clujului 120, Oradea",
                Latitude = 47.0880m, Longitude = 21.9000m,
                Sports = "golf", Surface = "grass", HasLights = false,
                MainPhotoUrl = "https://picsum.photos/seed/golf-club-oradea/1200/700",
                SecondaryPhotoUrls = new List<string>
                {
                    "https://picsum.photos/seed/golf-club-oradea-2/800/500",
                    "https://picsum.photos/seed/golf-club-oradea-3/800/500",
                },
                Details = "Teren de golf 9 găuri pe 35ha, practice range cu 20 de locuri acoperite, putting green. Închirieri echipament, lecții cu pro-instructor. Singurul club de golf din Bihor.",
                Status = LocationStatus.Approved, CreatedAt = seed
            },
        };

        context.Locations.AddRange(locations);
        await context.SaveChangesAsync();
    }
}
