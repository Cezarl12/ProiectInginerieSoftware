using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Users;

/// <summary>Date pentru actualizarea profilului. Câmpurile null sunt ignorate.</summary>
public class UpdateUserDto
{
    /// <summary>Noul nume de utilizator (3–100 caractere). Null = fără modificare.</summary>
    /// <example>ion_popescu_nou</example>
    [StringLength(100, MinimumLength = 3)]
    public string? Username { get; set; }

    /// <summary>URL-ul noii poze de profil (absolut sau relativ). Null = fără modificare.</summary>
    /// <example>/uploads/avatars/1_abcd.png</example>
    [StringLength(255)]
    public string? ProfilePhotoUrl { get; set; }

    /// <summary>Sporturi favorite, separate prin virgulă. Null = fără modificare.</summary>
    /// <example>fotbal, tenis</example>
    [StringLength(255)]
    public string? FavoriteSports { get; set; }
}
