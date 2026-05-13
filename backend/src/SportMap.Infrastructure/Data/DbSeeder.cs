using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.Enums;

namespace SportMap.Infrastructure.Data;

public static class DbSeeder
{
    // ── Sport photo library ────────────────────────────────────────────────
    // Every photo is a real Unsplash CDN image matched to its sport.
    private static string U(string id, int w = 1200, int h = 700) =>
        $"https://images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop&q=80";

    private static readonly Dictionary<string, string> SportMainPhoto = new(StringComparer.OrdinalIgnoreCase)
    {
        ["football"]     = U("1508098682722-e99c43a406b2"),
        ["tennis"]       = U("1554068865-24cecd4e34b8"),
        ["padel"]        = U("1619693286886-8ed735e42d49"),
        ["basketball"]   = U("1546519638-68e109498ffc"),
        ["swimming"]     = U("1530549387789-4c1017266635"),
        ["running"]      = U("1552674605-db6ffd4facb5"),
        ["athletics"]    = U("1552674605-db6ffd4facb5"),
        ["fitness"]      = U("1534438327276-14e5300c3a48"),
        ["yoga"]         = U("1544367567-0f2fcb009e0b"),
        ["volleyball"]   = U("1612872087720-bb876e2e67d1"),
        ["handball"]     = U("1577223625816-7546f13df25d"),
        ["golf"]         = U("1535131749006-b7f58c99034b"),
        ["boxing"]       = U("1549719386-74dfcbf7dbed"),
        ["martial arts"] = U("1555597673-b21d5c935865"),
        ["rugby"]        = U("1575361204480-aadea25e6e68"),
        ["cycling"]      = U("1558981403-c5f9899a28bc"),
        ["badminton"]    = U("1613918431703-aa50889e3be7"),
        ["skiing"]       = U("1551698618-1dfe5d97d256"),
        ["surfing"]      = U("1502680390469-be75c86b636f"),
        ["cricket"]      = U("1540747913346-19e32dc3e97e"),
        ["default"]      = U("1571019614242-c5c5dee9f50b"),
    };

    private static readonly Dictionary<string, List<string>> SportSecondaryPhotos =
        new(StringComparer.OrdinalIgnoreCase)
    {
        ["football"]     = [U("1431324155629-1a6deb1dec8d",800,500), U("1543326727-cf6c39e8f84c",800,500), U("1574629810360-7efbbe195018",800,500)],
        ["tennis"]       = [U("1571019613454-1cb2f99b2d8b",800,500), U("1622163642998-1ea32b0bbc67",800,500), U("1560012057-4372e14c5085",800,500)],
        ["padel"]        = [U("1554068865-24cecd4e34b8",800,500), U("1619693286886-8ed735e42d49",800,500), U("1622163642998-1ea32b0bbc67",800,500)],
        ["basketball"]   = [U("1546519638-68e109498ffc",800,500), U("1504450758481-7338eba7524a",800,500), U("1474224021254-1c1d3d6bb6f1",800,500)],
        ["swimming"]     = [U("1530549387789-4c1017266635",800,500), U("1519315901367-f34ff9154487",800,500), U("1560089000-7433a4ebbd64",800,500)],
        ["running"]      = [U("1552674605-db6ffd4facb5",800,500), U("1571008887538-b36bb32f4571",800,500), U("1486218119243-13301702cb03",800,500)],
        ["athletics"]    = [U("1552674605-db6ffd4facb5",800,500), U("1571008887538-b36bb32f4571",800,500)],
        ["fitness"]      = [U("1534438327276-14e5300c3a48",800,500), U("1540497077202-7c8a3999166f",800,500), U("1571019614242-c5c5dee9f50b",800,500)],
        ["yoga"]         = [U("1544367567-0f2fcb009e0b",800,500), U("1506126613408-eca07ce68773",800,500), U("1588286840104-8957b019727f",800,500)],
        ["volleyball"]   = [U("1612872087720-bb876e2e67d1",800,500), U("1592656094267-764a45160876",800,500), U("1569937756447-68e09bef33db",800,500)],
        ["handball"]     = [U("1577223625816-7546f13df25d",800,500), U("1571019614242-c5c5dee9f50b",800,500), U("1540497077202-7c8a3999166f",800,500)],
        ["golf"]         = [U("1535131749006-b7f58c99034b",800,500), U("1593111774240-d529f12cf4bb",800,500), U("1576858574144-9ae1ebcf5ae5",800,500)],
        ["boxing"]       = [U("1549719386-74dfcbf7dbed",800,500), U("1574680096145-d05b474e2155",800,500), U("1517438476312-10d79c077509",800,500)],
        ["martial arts"] = [U("1555597673-b21d5c935865",800,500), U("1485965120184-e220f721d03e",800,500), U("1571019614242-c5c5dee9f50b",800,500)],
        ["rugby"]        = [U("1575361204480-aadea25e6e68",800,500), U("1541252260730-0412e8e2108e",800,500), U("1574629810360-7efbbe195018",800,500)],
        ["cycling"]      = [U("1558981403-c5f9899a28bc",800,500), U("1571068316344-75bc76f77890",800,500), U("1534787238916-9ba6764efd4f",800,500)],
        ["badminton"]    = [U("1613918431703-aa50889e3be7",800,500), U("1599586120429-48281b6f0ece",800,500), U("1491466424936-e304919aada7",800,500)],
        ["skiing"]       = [U("1551698618-1dfe5d97d256",800,500), U("1568572933382-74d440642117",800,500), U("1535581652167-3a26c90f0f65",800,500)],
        ["surfing"]      = [U("1502680390469-be75c86b636f",800,500), U("1455729552865-3658a5d39692",800,500), U("1446043778965-d05ac4bef9e3",800,500)],
        ["cricket"]      = [U("1540747913346-19e32dc3e97e",800,500), U("1593359677879-a4bb92f4834c",800,500), U("1606925797300-0b35e9d1794e",800,500)],
        ["default"]      = [U("1571019614242-c5c5dee9f50b",800,500), U("1534438327276-14e5300c3a48",800,500)],
    };

    private static string MainPhoto(string sports)
    {
        var primary = sports.Split(',')[0].Trim().ToLower();
        return SportMainPhoto.TryGetValue(primary, out var url) ? url : SportMainPhoto["default"];
    }

    private static List<string> SecondaryPhotos(string sports)
    {
        var primary = sports.Split(',')[0].Trim().ToLower();
        return SportSecondaryPhotos.TryGetValue(primary, out var list) ? list : SportSecondaryPhotos["default"];
    }

    // ── Admin seed ─────────────────────────────────────────────────────────
    public static async Task SeedAdminAsync(SportMapDbContext context, IPasswordHasher hasher)
    {
        if (context.Users.Any(u => u.Role == UserRole.Admin)) return;

        context.Users.Add(new User
        {
            Username = "admin",
            Email = "admin@sportmap.local",
            PasswordHash = hasher.Hash("Admin123!"),
            Role = UserRole.Admin,
            IsEmailConfirmed = true,
            CreatedAt = DateTime.UtcNow,
        });
        await context.SaveChangesAsync();
    }

    // ── Patch: replace old picsum photos with real sport photos ────────────
    public static async Task PatchLocationPhotosAsync(SportMapDbContext context)
    {
        var locations = await context.Locations.ToListAsync();
        var changed = false;
        foreach (var loc in locations)
        {
            var expectedMain      = MainPhoto(loc.Sports);
            var expectedSecondary = SecondaryPhotos(loc.Sports);
            if (loc.MainPhotoUrl != expectedMain ||
                !loc.SecondaryPhotoUrls.SequenceEqual(expectedSecondary))
            {
                loc.MainPhotoUrl        = expectedMain;
                loc.SecondaryPhotoUrls  = expectedSecondary;
                changed = true;
            }
        }
        if (changed) await context.SaveChangesAsync();
    }

    // ── Bucharest locations ────────────────────────────────────────────────
    public static async Task SeedLocationsAsync(SportMapDbContext context)
    {
        if (context.Locations.Any(l => l.Name == "Arena Națională")) return;

        var seed = DateTime.UtcNow;

        var locations = new List<Location>
        {
            new() { Name="Arena Națională", Address="Bd. Basarabia 37-39, București",
                Latitude=44.4383m, Longitude=26.1218m, Sports="football", Surface="grass", HasLights=true,
                MainPhotoUrl=MainPhoto("football"), SecondaryPhotoUrls=SecondaryPhotos("football"),
                Details="Arena Națională este cel mai mare stadion din România, cu o capacitate de 55.000 de locuri. Gazon sintetic generația a 4-a, iluminat LED profesional, tribunele acoperite integral.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Parcul Izvor – Terenuri Fotbal", Address="Str. Izvor 7, București",
                Latitude=44.4283m, Longitude=26.0908m, Sports="football,running", Surface="grass", HasLights=false,
                MainPhotoUrl=MainPhoto("football"), SecondaryPhotoUrls=SecondaryPhotos("football"),
                Details="Terenuri de fotbal în Parcul Izvor. Două terenuri de 11 și două de 7, acces liber. Ideale pentru meciuri amicale.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Complexul Tenis Progresul", Address="Str. Progresul 20, București",
                Latitude=44.4120m, Longitude=26.0836m, Sports="tennis,padel", Surface="clay", HasLights=true,
                MainPhotoUrl=MainPhoto("tennis"), SecondaryPhotoUrls=SecondaryPhotos("tennis"),
                Details="8 terenuri de tenis zgură și 4 terenuri de padel acoperite. Iluminat nocturn, vestiare moderne, restaurant.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Bazinul Olimpic Dinamo", Address="Str. Camil Ressu 5, București",
                Latitude=44.4590m, Longitude=26.1113m, Sports="swimming", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("swimming"), SecondaryPhotoUrls=SecondaryPhotos("swimming"),
                Details="Bazin olimpic 50m, 8 culoare. Temperatura apei 27°C. Bazin separat pentru copii.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sala Sporturilor Floreasca", Address="Bd. Floreasca 40, București",
                Latitude=44.4560m, Longitude=26.1044m, Sports="basketball,volleyball,handball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("basketball"), SecondaryPhotoUrls=SecondaryPhotos("basketball"),
                Details="Sală polivalentă cu 3.000 locuri. Teren omologat FIBA pentru baschet și EHF pentru handbal.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Pista de Alergare Herăstrău", Address="Aleea Herăstrău 2, București",
                Latitude=44.4659m, Longitude=26.0900m, Sports="running,cycling", Surface="asphalt", HasLights=false,
                MainPhotoUrl=MainPhoto("running"), SecondaryPhotoUrls=SecondaryPhotos("running"),
                Details="Pistă de alergare și ciclism de 3,8 km în jurul Lacului Herăstrău. Deschisă non-stop, fără taxă.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Studio Yoga & Wellness Central", Address="Str. Academiei 12, București",
                Latitude=44.4367m, Longitude=26.1018m, Sports="yoga,fitness", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("yoga"), SecondaryPhotoUrls=SecondaryPhotos("yoga"),
                Details="Studio cu 3 săli, capacitate 80 persoane. Clase de Hatha, Vinyasa, Yin și meditație.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Fitness Park Unirii", Address="Piața Unirii 1, București",
                Latitude=44.4318m, Longitude=26.1025m, Sports="fitness,running", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("fitness"), SecondaryPhotoUrls=SecondaryPhotos("fitness"),
                Details="Sală fitness premium cu echipamente Technogym, saună finlandeză. Program 06:00–23:00.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Complexul Sportiv CSA Steaua", Address="Bd. Ghencea 49, București",
                Latitude=44.4225m, Longitude=26.0615m, Sports="football,athletics", Surface="tartan", HasLights=true,
                MainPhotoUrl=MainPhoto("football"), SecondaryPhotoUrls=SecondaryPhotos("football"),
                Details="Stadion 30.000 locuri, pistă de atletism tartanică omologată IAAF.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sala de Box Olympia", Address="Str. Olari 32, București",
                Latitude=44.4315m, Longitude=26.1188m, Sports="boxing", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("boxing"), SecondaryPhotoUrls=SecondaryPhotos("boxing"),
                Details="Club cu tradiție în boxul românesc. Ring omologat, 20 saci, antrenori olimpici.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Padel Club Băneasa", Address="Șos. București-Ploiești 42D, București",
                Latitude=44.4975m, Longitude=26.0836m, Sports="padel,tennis", Surface="artificial turf", HasLights=true,
                MainPhotoUrl=MainPhoto("padel"), SecondaryPhotoUrls=SecondaryPhotos("padel"),
                Details="6 terenuri de padel acoperite și 2 exterioare, toate iluminate. Cel mai mare club de padel din București.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Parcul Tineretului – Alee Sport", Address="Bd. Tineretului 6, București",
                Latitude=44.4132m, Longitude=26.1024m, Sports="running,yoga,fitness", Surface="asphalt", HasLights=false,
                MainPhotoUrl=MainPhoto("running"), SecondaryPhotoUrls=SecondaryPhotos("running"),
                Details="Alee de sport 4,2 km cu stații fitness, platforme yoga și teren calistenie. Acces liber 24/7.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sala Arte Marțiale Dragon", Address="Str. Bărăției 6, București",
                Latitude=44.4415m, Longitude=26.0954m, Sports="martial arts,boxing", Surface="tatami", HasLights=true,
                MainPhotoUrl=MainPhoto("martial arts"), SecondaryPhotoUrls=SecondaryPhotos("martial arts"),
                Details="300mp tatami. Discipline: Karate, Judo, BJJ, Kickboxing, MMA. Grupe 6–60+ ani.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Rugby Club Arcul de Triumf", Address="Str. Aviatiei 1, București",
                Latitude=44.4631m, Longitude=26.0750m, Sports="rugby,football", Surface="grass", HasLights=true,
                MainPhotoUrl=MainPhoto("rugby"), SecondaryPhotoUrls=SecondaryPhotos("rugby"),
                Details="Teren omologat World Rugby. Gazda meciurilor echipei naționale de rugby.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Volleyball Arena Colentina", Address="Str. Fundeni 3, București",
                Latitude=44.4685m, Longitude=26.1328m, Sports="volleyball,basketball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("volleyball"), SecondaryPhotoUrls=SecondaryPhotos("volleyball"),
                Details="2 terenuri de volei și un teren de baschet. Pardoseală profesională din lemn.",
                Status=LocationStatus.Approved, CreatedAt=seed },
        };

        context.Locations.AddRange(locations);
        await context.SaveChangesAsync();
    }

    // ── Oradea locations ───────────────────────────────────────────────────
    public static async Task SeedOradeaLocationsAsync(SportMapDbContext context)
    {
        if (context.Locations.Any(l => l.Name == "Stadionul Municipal Oradea")) return;

        var seed = DateTime.UtcNow;

        var locations = new List<Location>
        {
            new() { Name="Stadionul Municipal Oradea", Address="Str. Calea Clujului 1, Oradea",
                Latitude=47.0701m, Longitude=21.9082m, Sports="football,athletics", Surface="grass", HasLights=true,
                MainPhotoUrl=MainPhoto("football"), SecondaryPhotoUrls=SecondaryPhotos("football"),
                Details="Stadion 20.000 locuri, gazon natural omologat UEFA. Gazda meciurilor FC Bihor Oradea.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Arena Antonio Alexe", Address="Str. Calea Clujului 3, Oradea",
                Latitude=47.0698m, Longitude=21.9095m, Sports="basketball,handball,volleyball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("basketball"), SecondaryPhotoUrls=SecondaryPhotos("basketball"),
                Details="Sală polivalentă 5.000 locuri, teren omologat FIBA și EHF. Parchet profesional de competiție.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Piscina Olimpică Oradea", Address="Str. Dacia 1, Oradea",
                Latitude=47.0740m, Longitude=21.9340m, Sports="swimming", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("swimming"), SecondaryPhotoUrls=SecondaryPhotos("swimming"),
                Details="Bazin olimpic 50m, 8 culoare, bazin de sărituri. Program 06:00–22:00.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Complexul Tenis Bel Air", Address="Str. Oneștilor 4, Oradea",
                Latitude=47.0795m, Longitude=21.9155m, Sports="tennis,padel", Surface="clay", HasLights=true,
                MainPhotoUrl=MainPhoto("tennis"), SecondaryPhotoUrls=SecondaryPhotos("tennis"),
                Details="10 terenuri zgură + 4 terenuri padel acoperite. Turnee lunare pentru juniori și adulți.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sala Sporturilor Universității", Address="Str. Universității 1, Oradea",
                Latitude=47.0658m, Longitude=21.9310m, Sports="volleyball,basketball,handball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("volleyball"), SecondaryPhotoUrls=SecondaryPhotos("volleyball"),
                Details="Sală polivalentă 1.500 locuri. Teren omologat pentru competiții universitare naționale.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Parcul Brătianu – Pistă Alergare", Address="Bd. Dacia 10, Oradea",
                Latitude=47.0760m, Longitude=21.9370m, Sports="running,cycling", Surface="asphalt", HasLights=false,
                MainPhotoUrl=MainPhoto("running"), SecondaryPhotoUrls=SecondaryPhotos("running"),
                Details="Pistă de 2,4 km în jurul parcului. Suprafață renovată, acces gratuit non-stop.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Aquapark Nymphaea", Address="Str. Cantemir 1, Oradea",
                Latitude=47.0612m, Longitude=21.9462m, Sports="swimming,fitness", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("swimming"), SecondaryPhotoUrls=SecondaryPhotos("swimming"),
                Details="Complex acvatic 8ha cu piscine termale 36°C, tobogane și bazine sportive. Unul dintre cele mai mari aquaparkuri din România.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Tennis Club Oradea", Address="Str. Traian Moșoiu 14, Oradea",
                Latitude=47.0722m, Longitude=21.9180m, Sports="tennis", Surface="hard", HasLights=true,
                MainPhotoUrl=MainPhoto("tennis"), SecondaryPhotoUrls=SecondaryPhotos("tennis"),
                Details="6 terenuri hard acoperite și 2 exterioare. Antrenori LPF certificați.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Bazin Ioșia", Address="Str. Corneliu Coposu 5, Oradea",
                Latitude=47.0520m, Longitude=21.9198m, Sports="swimming", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("swimming"), SecondaryPhotoUrls=SecondaryPhotos("swimming"),
                Details="Bazin semiolimpic 25m, 6 culoare. Program 07:00–21:00.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Padel Arena Oradea", Address="Str. Republicii 22, Oradea",
                Latitude=47.0668m, Longitude=21.9285m, Sports="padel,tennis", Surface="artificial turf", HasLights=true,
                MainPhotoUrl=MainPhoto("padel"), SecondaryPhotoUrls=SecondaryPhotos("padel"),
                Details="4 terenuri padel acoperite. Antrenori certificați WPT, ligă amatori lunară.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Gold's Gym Oradea", Address="Bd. Magheru 10, Oradea",
                Latitude=47.0730m, Longitude=21.9255m, Sports="fitness,yoga", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("fitness"), SecondaryPhotoUrls=SecondaryPhotos("fitness"),
                Details="Sală premium 1.200mp Technogym, clase yoga, Pilates și HIIT. Program 06:00–23:00.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Studio Yoga Lotus Oradea", Address="Str. Piața Unirii 3, Oradea",
                Latitude=47.0648m, Longitude=21.9315m, Sports="yoga,fitness", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("yoga"), SecondaryPhotoUrls=SecondaryPhotos("yoga"),
                Details="2 săli Hatha, Vinyasa, Yin yoga și meditație. Instructori certificați Yoga Alliance.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Stadionul Nufărul", Address="Str. Nufărului 30, Oradea",
                Latitude=47.0840m, Longitude=21.9380m, Sports="football", Surface="artificial turf", HasLights=true,
                MainPhotoUrl=MainPhoto("football"), SecondaryPhotoUrls=SecondaryPhotos("football"),
                Details="Stadion gazon sintetic gen. 4, 3.000 locuri. Baza echipelor de juniori din Oradea.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Boxing Club Crișana", Address="Str. Primăriei 7, Oradea",
                Latitude=47.0680m, Longitude=21.9240m, Sports="boxing", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("boxing"), SecondaryPhotoUrls=SecondaryPhotos("boxing"),
                Details="40 ani tradiție. Ring omologat FRB, 15 saci. Grupe începători, avansați și performanță.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sala Arte Marțiale Dragon Oradea", Address="Str. Mihai Eminescu 8, Oradea",
                Latitude=47.0695m, Longitude=21.9270m, Sports="martial arts,boxing", Surface="tatami", HasLights=true,
                MainPhotoUrl=MainPhoto("martial arts"), SecondaryPhotoUrls=SecondaryPhotos("martial arts"),
                Details="250mp tatami: Karate, Judo, BJJ, MMA. Antrenori dan 4–6. Grupe 5–60 ani.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Rugby Club Oradea", Address="Str. Calea Aradului 12, Oradea",
                Latitude=47.0570m, Longitude=21.9165m, Sports="rugby,football", Surface="grass", HasLights=true,
                MainPhotoUrl=MainPhoto("rugby"), SecondaryPhotoUrls=SecondaryPhotos("rugby"),
                Details="Teren omologat World Rugby. Sesiuni deschise marți și joi.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Baza Sportivă Bihorul", Address="Str. Calea Bihorului 20, Oradea",
                Latitude=47.0590m, Longitude=21.9420m, Sports="football,athletics", Surface="tartan", HasLights=true,
                MainPhotoUrl=MainPhoto("athletics"), SecondaryPhotoUrls=SecondaryPhotos("athletics"),
                Details="Pistă tartanică omologată + teren fotbal + săli de forță. Centru de pregătire atletism.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Termoelectrica Arena", Address="Str. Decebal 2, Oradea",
                Latitude=47.0635m, Longitude=21.9410m, Sports="basketball,volleyball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("basketball"), SecondaryPhotoUrls=SecondaryPhotos("basketball"),
                Details="Sală 2.000 locuri, parchet profesional. Ligă amatori vineri seara.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Terenuri Sintetice Rogerius", Address="Str. Rogerius 5, Oradea",
                Latitude=47.0810m, Longitude=21.9060m, Sports="football", Surface="artificial turf", HasLights=true,
                MainPhotoUrl=MainPhoto("football"), SecondaryPhotoUrls=SecondaryPhotos("football"),
                Details="4 mini-terenuri sintetice (5vs5, 7vs7) iluminate. Rezervări pe oră.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Complexul Badminton Oradea", Address="Str. Libertății 15, Oradea",
                Latitude=47.0652m, Longitude=21.9195m, Sports="badminton,fitness", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("badminton"), SecondaryPhotoUrls=SecondaryPhotos("badminton"),
                Details="8 terenuri omologate BWF. Club 200 membri, turnee lunare.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Fitness Park Cetate", Address="Str. Cetății 1, Oradea",
                Latitude=47.0668m, Longitude=21.9350m, Sports="fitness,running", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("fitness"), SecondaryPhotoUrls=SecondaryPhotos("fitness"),
                Details="800mp Matrix + Life Fitness. Personal traineri, pistă indoor 200m.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Volleyball Club Crișul", Address="Str. Ștefan cel Mare 9, Oradea",
                Latitude=47.0710m, Longitude=21.9395m, Sports="volleyball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("volleyball"), SecondaryPhotoUrls=SecondaryPhotos("volleyball"),
                Details="3 terenuri omologate CEV. Echipe în Div. A2. Juniori 10-18 ani.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="CrossFit Oradea", Address="Str. Traian 24, Oradea",
                Latitude=47.0685m, Longitude=21.9158m, Sports="fitness", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("fitness"), SecondaryPhotoUrls=SecondaryPhotos("fitness"),
                Details="Box CrossFit afiliat 600mp. Coaches Level 2. Clase zilnice 07:00–21:00.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sala Handbal Crișana", Address="Str. Iuliu Maniu 18, Oradea",
                Latitude=47.0718m, Longitude=21.9330m, Sports="handball,volleyball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("handball"), SecondaryPhotoUrls=SecondaryPhotos("handball"),
                Details="800 locuri, teren EHF. Etapele de acasă CSM Oradea handbal.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Ciclodrumul Oradea", Address="Aleea Strandului 1, Oradea",
                Latitude=47.0778m, Longitude=21.9440m, Sports="cycling,running", Surface="asphalt", HasLights=false,
                MainPhotoUrl=MainPhoto("cycling"), SecondaryPhotoUrls=SecondaryPhotos("cycling"),
                Details="5,2 km de-a lungul Crișului Repede. Acces gratuit, peisaj superb.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Complexul Sportiv Exact", Address="Str. Calea Aradului 45, Oradea",
                Latitude=47.0542m, Longitude=21.9200m, Sports="fitness,yoga,swimming", Surface=null, HasLights=true,
                MainPhotoUrl=MainPhoto("fitness"), SecondaryPhotoUrls=SecondaryPhotos("fitness"),
                Details="Fitness 1.000mp + bazin 25m + studio yoga + saună. Abonament all-inclusive.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Terenuri Fotbal Velența", Address="Str. Velența 3, Oradea",
                Latitude=47.0732m, Longitude=21.9495m, Sports="football", Surface="grass", HasLights=false,
                MainPhotoUrl=MainPhoto("football"), SecondaryPhotoUrls=SecondaryPhotos("football"),
                Details="Două terenuri gazon natural în cartierul Velența. Acces liber pentru amicale.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sala Polivalentă CSU Oradea", Address="Str. Armatei Române 5, Oradea",
                Latitude=47.0660m, Longitude=21.9480m, Sports="basketball,volleyball,handball", Surface="hardcourt", HasLights=true,
                MainPhotoUrl=MainPhoto("basketball"), SecondaryPhotoUrls=SecondaryPhotos("basketball"),
                Details="Baza CSU Oradea baschet feminin, campioană a României. 3.500 locuri.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Parcul Petofi – Zone Sport", Address="Str. Petőfi Sándor 2, Oradea",
                Latitude=47.0600m, Longitude=21.9290m, Sports="running,yoga,fitness", Surface="asphalt", HasLights=false,
                MainPhotoUrl=MainPhoto("running"), SecondaryPhotoUrls=SecondaryPhotos("running"),
                Details="Stații calistenie, platforme yoga, jogging 1,8 km. Gratuit, non-stop.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Sport Arena Oradea", Address="Str. Independenței 40, Oradea",
                Latitude=47.0752m, Longitude=21.9130m, Sports="tennis,badminton,fitness", Surface="hard", HasLights=true,
                MainPhotoUrl=MainPhoto("tennis"), SecondaryPhotoUrls=SecondaryPhotos("tennis"),
                Details="4 terenuri tenis hard, 6 terenuri badminton, fitness 500mp. Rezervări online.",
                Status=LocationStatus.Approved, CreatedAt=seed },

            new() { Name="Golf Club Oradea", Address="Str. Calea Clujului 120, Oradea",
                Latitude=47.0880m, Longitude=21.9000m, Sports="golf", Surface="grass", HasLights=false,
                MainPhotoUrl=MainPhoto("golf"), SecondaryPhotoUrls=SecondaryPhotos("golf"),
                Details="9 găuri pe 35ha, practice range 20 locuri, putting green. Singurul golf club din Bihor.",
                Status=LocationStatus.Approved, CreatedAt=seed },
        };

        context.Locations.AddRange(locations);
        await context.SaveChangesAsync();
    }
}
