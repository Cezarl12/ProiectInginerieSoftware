using SportMap.Models.Enums;

namespace SportMap.Models.DTOs.Activities;

/// <summary>Filtre pentru lista de activități.</summary>
public class ActivityFilterDto
{
    /// <summary>Filtrează după sport (căutare parțială, case-insensitive).</summary>
    /// <example>fotbal</example>
    public string? Sport { get; set; }

    /// <summary>Filtrează după tip: Public (0) sau Private (1).</summary>
    public ActivityType? Type { get; set; }

    /// <summary>Returnează activitățile de la această dată inclusiv (UTC).</summary>
    public DateTime? FromDate { get; set; }

    /// <summary>Returnează activitățile până la această dată inclusiv (UTC).</summary>
    public DateTime? ToDate { get; set; }

    /// <summary>Filtrează după ID-ul locației.</summary>
    public int? LocationId { get; set; }
}
