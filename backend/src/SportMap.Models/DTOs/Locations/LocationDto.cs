namespace SportMap.Models.DTOs.Locations;

/// <summary>Detalii despre o locație sportivă.</summary>
public class LocationDto
{
    /// <summary>ID-ul numeric al locației.</summary>
    public int Id { get; set; }

    /// <summary>Numele locației.</summary>
    /// <example>Complexul de Tenis Lotus</example>
    public string Name { get; set; } = string.Empty;

    /// <summary>Adresa locației.</summary>
    /// <example>Calea Sântandrei 77, Oradea</example>
    public string Address { get; set; } = string.Empty;

    /// <summary>Latitudinea geografică.</summary>
    /// <example>47.0712</example>
    public decimal Latitude { get; set; }

    /// <summary>Longitudinea geografică.</summary>
    /// <example>21.9287</example>
    public decimal Longitude { get; set; }

    /// <summary>Sporturile disponibile (CSV).</summary>
    /// <example>tennis</example>
    public string Sports { get; set; } = string.Empty;

    /// <summary>Tipul suprafeței (opțional).</summary>
    /// <example>clay</example>
    public string? Surface { get; set; }

    /// <summary>Indică dacă locația are iluminat nocturn.</summary>
    public bool HasLights { get; set; }

    /// <summary>URL-ul pozei principale a locației.</summary>
    public string? MainPhotoUrl { get; set; }

    /// <summary>URL-urile pozelor secundare ale locației.</summary>
    public List<string> SecondaryPhotoUrls { get; set; } = new();

    /// <summary>Descriere detaliată a locației.</summary>
    public string? Details { get; set; }

    /// <summary>Statusul de aprobare al locației.</summary>
    /// <example>Approved</example>
    public string Status { get; set; } = string.Empty;

    /// <summary>ID-ul utilizatorului care a propus locația.</summary>
    public int? ProposedByUserId { get; set; }

    /// <summary>Username-ul utilizatorului care a propus locația.</summary>
    public string? ProposedByUsername { get; set; }

    /// <summary>Data adăugării locației (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Distanța față de punctul de căutare (km). Populat doar la /nearby.</summary>
    public double? DistanceKm { get; set; }
}
