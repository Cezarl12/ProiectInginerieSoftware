using SportMap.Models.Enums;

namespace SportMap.Core.Entities;

public class Location
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public LocationStatus Status { get; set; } = LocationStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
