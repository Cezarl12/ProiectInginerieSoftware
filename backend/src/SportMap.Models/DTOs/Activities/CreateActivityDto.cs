using SportMap.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Activities;

/// <summary>Date pentru crearea unei activități sportive noi.</summary>
public class CreateActivityDto
{
    /// <summary>Titlul activității (1–100 caractere).</summary>
    /// <example>Meci amical de fotbal</example>
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Tipul de sport (1–50 caractere).</summary>
    /// <example>fotbal</example>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Sport { get; set; } = string.Empty;

    /// <summary>Data și ora activității (UTC) — trebuie să fie în viitor.</summary>
    [Required]
    public DateTime DateTime { get; set; }

    /// <summary>Numărul maxim de participanți (1–100).</summary>
    /// <example>10</example>
    [Required]
    [Range(1, 100)]
    public int MaxParticipants { get; set; }

    /// <summary>Tipul activității: Public (0) sau Private (1).</summary>
    /// <example>Public</example>
    [Required]
    public ActivityType Type { get; set; }

    /// <summary>ID-ul locației aprobate unde se va desfășura activitatea.</summary>
    /// <example>1</example>
    [Required]
    public int LocationId { get; set; }

    /// <summary>Descriere opțională (max 500 caractere).</summary>
    /// <example>Meci prietenos, toți sunt bineveniti.</example>
    [StringLength(500)]
    public string? Description { get; set; }
}
