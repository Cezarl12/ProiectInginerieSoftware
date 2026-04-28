using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Users;

public class UpdateUserDto
{
    [StringLength(100, MinimumLength = 3)]
    public string? Username { get; set; }

    [Url]
    [StringLength(255)]
    public string? ProfilePhotoUrl { get; set; }

    [StringLength(255)]
    public string? FavoriteSports { get; set; }
}
