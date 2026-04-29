using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Auth;

/// <summary>Cerere de reînnoire token JWT.</summary>
public class RefreshRequestDto
{
    /// <summary>Refresh token-ul primit la autentificare.</summary>
    /// <example>dGhpcyBpcyBhIHNhbXBsZSByZWZyZXNoIHRva2Vu</example>
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
