using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Auth;

/// <summary>Date pentru înregistrarea unui cont nou.</summary>
public class RegisterDto
{
    /// <summary>Nume de utilizator unic (3–100 caractere).</summary>
    /// <example>ion_popescu</example>
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    /// <summary>Adresa de email validă — va primi link de confirmare.</summary>
    /// <example>ion.popescu@example.com</example>
    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Parolă (minim 8 caractere).</summary>
    /// <example>Parola@123</example>
    [Required]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters.")]
    public string Password { get; set; } = string.Empty;
}
