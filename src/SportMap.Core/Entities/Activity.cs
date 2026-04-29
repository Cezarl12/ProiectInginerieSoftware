using SportMap.Models.Enums;

namespace SportMap.Core.Entities;

public class Activity
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public DateTime DateTime { get; set; }
    public int MaxParticipants { get; set; }
    public ActivityType Type { get; set; }
    public string? Description { get; set; }

    public int OrganizerId { get; set; }
    public int LocationId { get; set; }

    public User? Organizer { get; set; }
    public Location? Location { get; set; }
    public ICollection<Participation> Participations { get; set; } = new List<Participation>();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
