using System.ComponentModel.DataAnnotations;

namespace SportMap.Models.DTOs.Users;

/// <summary>Date pentru schimbarea parolei contului curent.</summary>
public class ChangePasswordDto
{
    /// <summary>Parola curentă (necesară pentru verificare).</summary>
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>Noua parolă (minim 8 caractere).</summary>
    /// <example>NovaParola@456</example>
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;
}
