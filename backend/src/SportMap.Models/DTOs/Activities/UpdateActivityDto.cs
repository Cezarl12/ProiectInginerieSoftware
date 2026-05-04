using SportMap.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Activities;

/// <summary>Date pentru actualizarea unei activități. Câmpurile null sunt ignorate.</summary>
public class UpdateActivityDto
{
    /// <summary>Noul titlu (1–100 caractere). Null = fără modificare.</summary>
    /// <example>Meci amical de fotbal — ediție specială</example>
    [StringLength(100, MinimumLength = 1)]
    public string? Title { get; set; }

    /// <summary>Noul sport (1–50 caractere). Null = fără modificare.</summary>
    /// <example>fotbal</example>
    [StringLength(50, MinimumLength = 1)]
    public string? Sport { get; set; }

    /// <summary>Noua dată și oră (UTC, în viitor). Null = fără modificare.</summary>
    public DateTime? DateTime { get; set; }

    /// <summary>Noul număr maxim de participanți (1–100). Null = fără modificare.</summary>
    /// <example>12</example>
    [Range(1, 100)]
    public int? MaxParticipants { get; set; }

    /// <summary>Noul tip: Public (0) sau Private (1). Null = fără modificare.</summary>
    public ActivityType? Type { get; set; }

    /// <summary>ID-ul noii locații aprobate. Null = fără modificare.</summary>
    public int? LocationId { get; set; }

    /// <summary>Noua descriere (max 500 caractere). Null = fără modificare.</summary>
    [StringLength(500)]
    public string? Description { get; set; }
}
