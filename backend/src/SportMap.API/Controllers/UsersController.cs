using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.Common;
using SportMap.Models.DTOs.Activities;
using SportMap.Models.DTOs.Users;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace SportMap.API.Controllers;

/// <summary>Gestionarea profilelor și activităților utilizatorilor.</summary>
[ApiController]
[Route("api/users")]
[Authorize]
[Tags("Users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IActivityService _activityService;
    private readonly IWebHostEnvironment _env;

    public UsersController(IUserService userService, IActivityService activityService, IWebHostEnvironment env)
    {
        _userService = userService;
        _activityService = activityService;
        _env = env;
    }

    /// <summary>Listează toți utilizatorii înregistrați.</summary>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Listă utilizatori",
        Description = "Returnează toți utilizatorii înregistrați. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Pagină utilizatori", typeof(PagedResult<UserDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserDto>>> GetAll([FromQuery] PaginationQuery pagination)
    {
        var users = await _userService.GetAllAsync(pagination);
        return Ok(users);
    }

    /// <summary>Returnează profilul public al unui utilizator după ID.</summary>
    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Detalii utilizator",
        Description = "Returnează profilul public al unui utilizator identificat prin ID numeric. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Utilizator găsit", typeof(UserDto))]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(404, "Utilizator inexistent")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

    /// <summary>Returnează profilul utilizatorului autentificat curent.</summary>
    [HttpGet("me")]
    [SwaggerOperation(
        Summary = "Profilul meu",
        Description = "Returnează datele de profil extrase din JWT-ul curent. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Profilul meu", typeof(UserDto))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        var user = await _userService.GetByIdAsync(userId);
        return user is null ? NotFound() : Ok(user);
    }

    /// <summary>Încarcă o poză de profil pentru utilizatorul autentificat.</summary>
    [HttpPost("me/photo")]
    [Consumes("multipart/form-data")]
    [SwaggerOperation(Summary = "Upload poză profil", Description = "Acceptă fișiere jpg/png/webp/gif ≤ 5 MB. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Poză încărcată", typeof(object))]
    [SwaggerResponse(400, "Fișier lipsă sau tip invalid")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadPhoto([FromForm] IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        var allowedExts = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        var ext = Path.GetExtension(file.FileName);
        if (!allowedExts.Contains(ext))
            return BadRequest(new { message = "Only image files (jpg, png, webp, gif) are allowed." });

        if (file.Length > 5_242_880)
            return BadRequest(new { message = "File size must not exceed 5 MB." });

        var webRoot = string.IsNullOrEmpty(_env.WebRootPath)
            ? Path.Combine(_env.ContentRootPath, "wwwroot")
            : _env.WebRootPath;
        var uploadsDir = Path.Combine(webRoot, "uploads", "avatars");
        Directory.CreateDirectory(uploadsDir);

        var userId = GetCurrentUserId();
        foreach (var old in Directory.GetFiles(uploadsDir, $"{userId}_*"))
        {
            try { System.IO.File.Delete(old); } catch { /* swallow */ }
        }

        var filename = $"{userId}_{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadsDir, filename);
        await using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream);

        var photoUrl = $"/uploads/avatars/{filename}";
        var updated = await _userService.UpdateAsync(userId, new UpdateUserDto { ProfilePhotoUrl = photoUrl });
        return Ok(new { url = photoUrl, user = updated });
    }

    /// <summary>Actualizează profilul utilizatorului autentificat.</summary>
    [HttpPut("me")]
    [SwaggerOperation(
        Summary = "Actualizare profil",
        Description = "Modifică username, poza de profil sau sporturile favorite. " +
                      "Câmpurile `null` sunt ignorate (semantică PATCH). **Necesită autentificare.**")]
    [SwaggerResponse(200, "Profil actualizat cu succes", typeof(UserDto))]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(409, "Username deja folosit de alt cont")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserDto>> UpdateCurrentUser([FromBody] UpdateUserDto dto)
    {
        var userId = GetCurrentUserId();
        var updated = await _userService.UpdateAsync(userId, dto);
        return Ok(updated);
    }

    /// <summary>Schimbă parola utilizatorului autentificat.</summary>
    [HttpPost("me/change-password")]
    [SwaggerOperation(
        Summary = "Schimbare parolă",
        Description = "Necesită parola curentă pentru verificare. " +
                      "După schimbare toate sesiunile active (refresh token-uri) sunt revocate. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Parolă schimbată cu succes")]
    [SwaggerResponse(401, "Parolă curentă incorectă sau neautentificat")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetCurrentUserId();
        await _userService.ChangePasswordAsync(userId, dto);
        return Ok(new { message = "Password changed successfully." });
    }

    /// <summary>Șterge definitiv contul utilizatorului autentificat.</summary>
    [HttpDelete("me")]
    [SwaggerOperation(
        Summary = "Ștergere cont",
        Description = "Șterge definitiv contul și toate datele asociate. **Operație ireversibilă. Necesită autentificare.**")]
    [SwaggerResponse(200, "Cont șters cu succes")]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteCurrentUser()
    {
        var userId = GetCurrentUserId();
        await _userService.DeleteAsync(userId);
        return Ok(new { message = "Account deleted successfully." });
    }

    /// <summary>Returnează activitățile unui utilizator specificat.</summary>
    [HttpGet("{id:int}/activities")]
    [SwaggerOperation(
        Summary = "Activitățile unui utilizator",
        Description = "Listează toate activitățile organizate de utilizatorul cu ID-ul dat. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Listă activități", typeof(IEnumerable<ActivityDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(404, "Utilizator inexistent")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetUserActivities(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user is null) return NotFound();

        var activities = await _activityService.GetByUserIdAsync(id);
        return Ok(activities);
    }

    /// <summary>Promovează un utilizator la rolul de Admin. [Admin only]</summary>
    [HttpPost("{id:int}/promote-to-admin")]
    [Authorize(Roles = "Admin")]
    [SwaggerOperation(
        Summary = "Promovare Admin",
        Description = "Schimbă rolul utilizatorului specificat din User în Admin. **Necesită rol Admin.**")]
    [SwaggerResponse(204, "Utilizator promovat cu succes")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(403, "Nu ai rol Admin")]
    [SwaggerResponse(404, "Utilizator inexistent")]
    [SwaggerResponse(409, "Utilizatorul este deja Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> PromoteToAdmin(int id)
    {
        await _userService.PromoteToAdminAsync(id);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        if (int.TryParse(sub, out var id)) return id;
        throw new UnauthorizedException("Invalid token: missing or malformed user identifier.");
    }
}
