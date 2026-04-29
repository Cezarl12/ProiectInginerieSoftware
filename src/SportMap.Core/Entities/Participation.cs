namespace SportMap.Core.Entities;

public class Participation
{
    public int Id { get; set; }
    public int ActivityId { get; set; }
    public int UserId { get; set; }

    public Activity Activity { get; set; } = null!;
    public User User { get; set; } = null!;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
