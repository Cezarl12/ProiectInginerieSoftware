namespace SportMap.Models.DTOs.Auth;

/// <summary>Răspuns la autentificare sau reînnoire token.</summary>
public class AuthResponseDto
{
    /// <summary>ID-ul numeric al utilizatorului autentificat.</summary>
    public int UserId { get; set; }

    /// <summary>Numele de utilizator.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>Adresa de email a utilizatorului.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Token JWT pentru accesarea endpointurilor protejate (valabil 15 minute).</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>Data și ora expirării token-ului JWT (UTC).</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Refresh token pentru reînnoirea JWT-ului fără reautentificare (valabil 7 zile).</summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>Data și ora expirării refresh token-ului (UTC).</summary>
    public DateTime RefreshTokenExpiry { get; set; }

    /// <summary>Rolul utilizatorului: User sau Admin.</summary>
    /// <example>User</example>
    public string Role { get; set; } = "User";
}
