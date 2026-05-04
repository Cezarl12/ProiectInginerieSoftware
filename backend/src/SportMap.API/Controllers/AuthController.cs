using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.DTOs.Auth;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace SportMap.API.Controllers;

/// <summary>Autentificare și gestionarea sesiunilor.</summary>
[ApiController]
[Route("api/auth")]
[Tags("Auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>Înregistrează un cont nou și trimite email de confirmare.</summary>
    [HttpPost("register")]
    [SwaggerOperation(
        Summary = "Înregistrare cont nou",
        Description = "Creează un utilizator nou și trimite un link de confirmare pe email. " +
                      "Contul nu poate fi folosit până la confirmarea adresei de email.")]
    [SwaggerResponse(201, "Cont creat — email de confirmare trimis", typeof(RegisterResponseDto))]
    [SwaggerResponse(400, "Date invalide (erori de validare)")]
    [SwaggerResponse(409, "Email sau username deja înregistrat")]
    [ProducesResponseType(typeof(RegisterResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var response = await _authService.RegisterAsync(dto);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>Confirmă adresa de email prin token-ul primit pe mail.</summary>
    [HttpGet("confirm-email")]
    [SwaggerOperation(
        Summary = "Confirmare email",
        Description = "Validează token-ul de confirmare primit pe email. " +
                      "După confirmare contul devine activ și utilizatorul se poate autentifica.")]
    [SwaggerResponse(200, "Email confirmat cu succes")]
    [SwaggerResponse(400, "Token invalid sau expirat")]
    [SwaggerResponse(404, "Token negăsit")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
    {
        await _authService.ConfirmEmailAsync(token);
        return Ok(new { message = "Email confirmed successfully. You can now log in." });
    }

    /// <summary>Autentifică utilizatorul și returnează JWT + refresh token.</summary>
    [HttpPost("login")]
    [SwaggerOperation(
        Summary = "Autentificare",
        Description = "Returnează un token JWT (valabil 15 min) și un refresh token (valabil 7 zile). " +
                      "Folosiți `token` în butonul **Authorize 🔒** pentru a accesa endpointurile protejate.")]
    [SwaggerResponse(200, "Autentificare reușită", typeof(AuthResponseDto))]
    [SwaggerResponse(401, "Email sau parolă incorecte / email neconfirmat")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        return Ok(response);
    }

    /// <summary>Emite un JWT nou pe baza unui refresh token valid.</summary>
    [HttpPost("refresh")]
    [SwaggerOperation(
        Summary = "Reînnoire token",
        Description = "Folosiți `refreshToken` (din răspunsul de login) pentru a obține un nou JWT fără reautentificare. " +
                      "Refresh token-ul este consumat și se emite unul nou.")]
    [SwaggerResponse(200, "Token reînnoit cu succes", typeof(AuthResponseDto))]
    [SwaggerResponse(401, "Refresh token invalid, expirat sau revocat")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Refresh([FromBody] RefreshRequestDto dto)
    {
        var response = await _authService.RefreshAsync(dto);
        return Ok(response);
    }

    /// <summary>Invalidează sesiunea curentă (revocă refresh token-ul). Necesită autentificare.</summary>
    [HttpPost("logout")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Deconectare",
        Description = "Revocă refresh token-ul utilizatorului curent. " +
                      "JWT-ul activ rămâne valid până la expirare naturală (max 15 min). " +
                      "**Necesită autentificare.**")]
    [SwaggerResponse(200, "Deconectat cu succes")]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!int.TryParse(sub, out var userId))
            return Unauthorized();

        await _authService.LogoutAsync(userId);
        return Ok(new { message = "Logged out successfully." });
    }
}
