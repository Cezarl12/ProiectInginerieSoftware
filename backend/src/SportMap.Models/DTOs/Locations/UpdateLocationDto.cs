using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Locations;

/// <summary>Date pentru actualizarea parțială a unei locații. Câmpurile null sunt ignorate.</summary>
public class UpdateLocationDto
{
    /// <summary>Noul nume al locației.</summary>
    [StringLength(100)]
    public string? Name { get; set; }

    /// <summary>Noua adresă a locației.</summary>
    [StringLength(200)]
    public string? Address { get; set; }

    /// <summary>Noua latitudine (-90..90).</summary>
    [Range(-90, 90)]
    public decimal? Latitude { get; set; }

    /// <summary>Noua longitudine (-180..180).</summary>
    [Range(-180, 180)]
    public decimal? Longitude { get; set; }

    /// <summary>Sporturile disponibile, separate prin virgulă.</summary>
    [StringLength(255)]
    public string? Sports { get; set; }

    /// <summary>Tipul suprafeței.</summary>
    [StringLength(50)]
    public string? Surface { get; set; }

    /// <summary>Dacă locația are iluminat nocturn.</summary>
    public bool? HasLights { get; set; }

    /// <summary>URL-ul pozei principale.</summary>
    [StringLength(500)]
    public string? MainPhotoUrl { get; set; }

    /// <summary>URL-urile pozelor secundare.</summary>
    public List<string>? SecondaryPhotoUrls { get; set; }

    /// <summary>Descriere detaliată.</summary>
    [StringLength(1000)]
    public string? Details { get; set; }
}
