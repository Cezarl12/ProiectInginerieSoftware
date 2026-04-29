namespace SportMap.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }
    public string? FavoriteSports { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsEmailConfirmed { get; set; }
    public string? EmailConfirmationToken { get; set; }
    public DateTime? EmailConfirmationTokenExpiry { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    public ICollection<Activity> OrganizedActivities { get; set; } = new List<Activity>();
    public ICollection<Participation> Participations { get; set; } = new List<Participation>();
}
