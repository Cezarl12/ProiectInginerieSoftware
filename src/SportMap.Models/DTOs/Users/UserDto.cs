namespace SportMap.Models.DTOs.Users;

/// <summary>Profilul public al unui utilizator.</summary>
public class UserDto
{
    /// <summary>ID-ul numeric unic al utilizatorului.</summary>
    public int Id { get; set; }

    /// <summary>Numele de utilizator.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Adresa de email a utilizatorului.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>URL-ul pozei de profil (null dacă nu este setată).</summary>
    public string? ProfilePhotoUrl { get; set; }

    /// <summary>Sporturile favorite, separate prin virgulă (null dacă nu sunt setate).</summary>
    /// <example>fotbal, tenis, ciclism</example>
    public string? FavoriteSports { get; set; }

    /// <summary>Data înregistrării contului (UTC).</summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>Rolul utilizatorului în platformă: User sau Admin.</summary>
    /// <example>User</example>
    public string Role { get; set; } = "User";
}
