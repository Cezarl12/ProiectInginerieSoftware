namespace SportMap.Core.Entities;

public class Friendship
{
    public int Id { get; set; }
    public int FollowerId { get; set; }
    public int FolloweeId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? Follower { get; set; }
    public User? Followee { get; set; }
}
