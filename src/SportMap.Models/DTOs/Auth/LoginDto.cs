using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Auth;

/// <summary>Credențiale pentru autentificare.</summary>
public class LoginDto
{
    /// <summary>Adresa de email înregistrată și confirmată.</summary>
    /// <example>ion.popescu@example.com</example>
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>Parola contului.</summary>
    /// <example>Parola@123</example>
    [Required]
    public string Password { get; set; } = string.Empty;
}
