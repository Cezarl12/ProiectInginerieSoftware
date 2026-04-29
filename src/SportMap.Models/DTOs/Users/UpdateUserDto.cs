using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Users;

/// <summary>Date pentru actualizarea profilului. Câmpurile null sunt ignorate.</summary>
public class UpdateUserDto
{
    /// <summary>Noul nume de utilizator (3–100 caractere). Null = fără modificare.</summary>
    /// <example>ion_popescu_nou</example>
    [StringLength(100, MinimumLength = 3)]
    public string? Username { get; set; }

    /// <summary>URL-ul noii poze de profil. Null = fără modificare.</summary>
    /// <example>https://example.com/avatar.jpg</example>
    [Url]
    [StringLength(255)]
    public string? ProfilePhotoUrl { get; set; }

    /// <summary>Sporturi favorite, separate prin virgulă. Null = fără modificare.</summary>
    /// <example>fotbal, tenis</example>
    [StringLength(255)]
    public string? FavoriteSports { get; set; }
}
