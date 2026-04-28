namespace SportMap.Models.DTOs.Users;

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }
    public string? FavoriteSports { get; set; }
    public DateTime CreatedAt { get; set; }
}
