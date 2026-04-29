using SportMap.Models.Enums;

namespace SportMap.Models.DTOs.Locations;

/// <summary>Detalii despre o locație sportivă.</summary>
public class LocationDto
{
    /// <summary>ID-ul numeric al locației.</summary>
    public int Id { get; set; }

    /// <summary>Numele locației.</summary>
    /// <example>Parcul Herăstrău — Teren de fotbal</example>
    public string Name { get; set; } = string.Empty;

    /// <summary>Adresa locației.</summary>
    /// <example>Șos. Pavel D. Kiseleff 32, București</example>
    public string Address { get; set; } = string.Empty;

    /// <summary>Latitudinea geografică.</summary>
    /// <example>44.4748</example>
    public double Latitude { get; set; }

    /// <summary>Longitudinea geografică.</summary>
    /// <example>26.0779</example>
    public double Longitude { get; set; }

    /// <summary>Statusul de aprobare al locației.</summary>
    /// <example>Approved</example>
    public LocationStatus Status { get; set; }

    /// <summary>Data adăugării locației (UTC).</summary>
    public DateTime CreatedAt { get; set; }
}
