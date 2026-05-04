namespace SportMap.Core.Entities;

public class Participation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ActivityId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public ParticipationStatus Status { get; set; } = ParticipationStatus.Active;

    public User? User { get; set; }
    public Activity? Activity { get; set; }
}
