using SportMap.Models.DTOs.Locations;
using SportMap.Models.DTOs.Users;
using SportMap.Models.Enums;

namespace SportMap.Models.DTOs.Activities;

/// <summary>Detalii despre o activitate sportivă.</summary>
public class ActivityDto
{
    /// <summary>ID-ul numeric al activității.</summary>
    public int Id { get; set; }

    /// <summary>Titlul descriptiv al activității.</summary>
    /// <example>Meci amical de fotbal în Parcul Herăstrău</example>
    public string Title { get; set; } = string.Empty;

    /// <summary>Tipul de sport practicat.</summary>
    /// <example>fotbal</example>
    public string Sport { get; set; } = string.Empty;

    /// <summary>Data și ora desfășurării activității (UTC).</summary>
    public DateTime DateTime { get; set; }

    /// <summary>Numărul maxim de participanți acceptați.</summary>
    /// <example>10</example>
    public int MaxParticipants { get; set; }

    /// <summary>Tipul activității: Public sau Private.</summary>
    /// <example>Public</example>
    public ActivityType Type { get; set; }

    /// <summary>Descriere opțională a activității.</summary>
    /// <example>Meci prietenos, toți sunt bineveniti. Aduceți ghete de fotbal.</example>
    public string? Description { get; set; }

    /// <summary>ID-ul utilizatorului organizator.</summary>
    public int OrganizerId { get; set; }

    /// <summary>ID-ul locației unde se desfășoară activitatea.</summary>
    public int LocationId { get; set; }

    /// <summary>Numărul curent de participanți confirmați.</summary>
    public int ParticipantCount { get; set; }

    /// <summary>Organizatorul activității.</summary>
    public UserDto? Organizer { get; set; }

    /// <summary>Locația unde se desfășoară activitatea.</summary>
    public LocationDto? Location { get; set; }

    /// <summary>Data creării activității (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Data ultimei modificări (UTC). Null dacă nu a fost modificată.</summary>
    public DateTime? UpdatedAt { get; set; }
}
