namespace SportMap.Models.DTOs.Auth;

/// <summary>Răspuns la înregistrarea unui cont nou.</summary>
public class RegisterResponseDto
{
    /// <summary>ID-ul utilizatorului nou creat.</summary>
    public int UserId { get; set; }

    /// <summary>Adresa de email la care s-a trimis link-ul de confirmare.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Mesaj informativ despre pașii următori.</summary>
    public string Message { get; set; } = string.Empty;
}
