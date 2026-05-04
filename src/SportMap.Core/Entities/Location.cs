using SportMap.Models.Enums;

namespace SportMap.Core.Entities;

public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string Sports { get; set; } = string.Empty;
    public string? Surface { get; set; }
    public bool HasLights { get; set; }
    public string? MainPhotoUrl { get; set; }
    public List<string> SecondaryPhotoUrls { get; set; } = new();
    public string? Details { get; set; }
    public LocationStatus Status { get; set; } = LocationStatus.Pending;
    public int? ProposedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public User? ProposedBy { get; set; }
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
