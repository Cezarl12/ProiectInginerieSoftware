using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Locations;

/// <summary>Date pentru propunerea unei locații noi.</summary>
public class CreateLocationDto
{
    /// <summary>Numele locației.</summary>
    /// <example>Teren de fotbal Parcul Central</example>
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Adresa completă a locației.</summary>
    /// <example>Str. Republicii 10, Oradea</example>
    [Required]
    [StringLength(200)]
    public string Address { get; set; } = string.Empty;

    /// <summary>Latitudinea geografică (-90..90).</summary>
    /// <example>47.0712</example>
    [Required]
    [Range(-90, 90)]
    public decimal Latitude { get; set; }

    /// <summary>Longitudinea geografică (-180..180).</summary>
    /// <example>21.9287</example>
    [Required]
    [Range(-180, 180)]
    public decimal Longitude { get; set; }

    /// <summary>Sporturile disponibile, separate prin virgulă.</summary>
    /// <example>football,tennis</example>
    [Required]
    [StringLength(255)]
    public string Sports { get; set; } = string.Empty;

    /// <summary>Tipul suprafeței (opțional).</summary>
    /// <example>grass</example>
    [StringLength(50)]
    public string? Surface { get; set; }

    /// <summary>Indică dacă locația are iluminat nocturn.</summary>
    public bool HasLights { get; set; }

    /// <summary>URL-ul pozei principale a locației.</summary>
    [StringLength(500)]
    public string? MainPhotoUrl { get; set; }

    /// <summary>URL-urile pozelor secundare ale locației.</summary>
    public List<string> SecondaryPhotoUrls { get; set; } = new();

    /// <summary>Descriere detaliată a locației.</summary>
    [StringLength(1000)]
    public string? Details { get; set; }
}
