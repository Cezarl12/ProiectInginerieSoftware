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

/// <summary>Gestionarea activităților sportive.</summary>
[ApiController]
[Route("api/activities")]
[Authorize]
[Tags("Activities")]
[ApiExplorerSettings(IgnoreApi = true)]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;
    private readonly IParticipationService _participationService;

    public ActivitiesController(IActivityService activityService, IParticipationService participationService)
    {
        _activityService = activityService;
        _participationService = participationService;
    }

    /// <summary>Listează activitățile cu filtre opționale.</summary>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Listă activități",
        Description = "Returnează activitățile vizibile curentului utilizator: toate Public + Private proprii sau ale celor urmăriți. " +
                      "Filtrare opțională după sport, tip, interval de date și locație. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Pagină activități", typeof(PagedResult<ActivityDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(PagedResult<ActivityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ActivityDto>>> GetAll([FromQuery] ActivityFilterDto filter, [FromQuery] PaginationQuery pagination)
    {
        var userId = GetCurrentUserId();
        var activities = await _activityService.GetAllAsync(filter, userId, pagination);
        return Ok(activities);
    }

    /// <summary>Returnează activitățile organizate de utilizatorul curent.</summary>
    [HttpGet("me/organized")]
    [SwaggerOperation(
        Summary = "Activitățile mele organizate",
        Description = "Returnează toate activitățile create de utilizatorul autentificat. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Listă activități organizate", typeof(IEnumerable<ActivityDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetMyOrganized()
    {
        var userId = GetCurrentUserId();
        var activities = await _activityService.GetOrganizedByUserAsync(userId);
        return Ok(activities);
    }

    /// <summary>Returnează activitățile la care s-a alăturat utilizatorul curent.</summary>
    [HttpGet("me/joined")]
    [SwaggerOperation(
        Summary = "Activitățile la care particip",
        Description = "Returnează activitățile la care utilizatorul curent s-a înscris ca participant. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Listă activități joined", typeof(IEnumerable<ActivityDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetMyJoined()
    {
        var userId = GetCurrentUserId();
        var activities = await _activityService.GetJoinedByUserAsync(userId);
        return Ok(activities);
    }

    /// <summary>Returnează detaliile unei activități după ID.</summary>
    [HttpGet("{id:int}")]
    [SwaggerOperation(
        Summary = "Detalii activitate",
        Description = "Returnează activitatea cu Organizer și Location incluse. " +
                      "Activitățile Private sunt vizibile doar organizatorului sau urmăritorilor acestuia. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Activitate găsită", typeof(ActivityDto))]
    [SwaggerResponse(401, "Neautentificat sau activitate privată inaccesibilă")]
    [SwaggerResponse(404, "Activitate inexistentă")]
    [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityDto>> GetById(int id)
    {
        var userId = GetCurrentUserId();
        var activity = await _activityService.GetByIdAsync(id, userId);
        return activity is null ? NotFound() : Ok(activity);
    }

    /// <summary>Creează o activitate nouă.</summary>
    [HttpPost]
    [SwaggerOperation(
        Summary = "Creare activitate",
        Description = "Creează o activitate. OrganizerId este setat automat din JWT. " +
                      "LocationId trebuie să aparțină unei locații cu status Approved. " +
                      "DateTime trebuie să fie în viitor. **Necesită autentificare.**")]
    [SwaggerResponse(201, "Activitate creată", typeof(ActivityDto))]
    [SwaggerResponse(400, "Date invalide (DateTime în trecut, MaxParticipants invalid)")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(404, "Locație inexistentă")]
    [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ActivityDto>> Create([FromBody] CreateActivityDto dto)
    {
        var userId = GetCurrentUserId();
        var created = await _activityService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Actualizează o activitate existentă.</summary>
    [HttpPut("{id:int}")]
    [SwaggerOperation(
        Summary = "Actualizare activitate",
        Description = "Permite modificarea activității. Câmpurile null sunt ignorate. " +
                      "Doar organizatorul poate face modificări. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Activitate actualizată", typeof(ActivityDto))]
    [SwaggerResponse(400, "Date invalide")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(403, "Nu ești organizatorul activității")]
    [SwaggerResponse(404, "Activitate sau locație inexistentă")]
    [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityDto>> Update(int id, [FromBody] UpdateActivityDto dto)
    {
        var userId = GetCurrentUserId();
        var updated = await _activityService.UpdateAsync(id, userId, dto);
        return Ok(updated);
    }

    /// <summary>Șterge o activitate.</summary>
    [HttpDelete("{id:int}")]
    [SwaggerOperation(
        Summary = "Ștergere activitate",
        Description = "Șterge definitiv activitatea și toate participările asociate. " +
                      "Doar organizatorul poate șterge. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Activitate ștearsă")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(403, "Nu ești organizatorul activității")]
    [SwaggerResponse(404, "Activitate inexistentă")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        await _activityService.DeleteAsync(id, userId);
        return Ok(new { message = "Activity deleted successfully." });
    }

    /// <summary>Înscrie utilizatorul curent la o activitate.</summary>
    [HttpPost("{id:int}/join")]
    [SwaggerOperation(
        Summary = "Join activitate",
        Description = "Înscrie utilizatorul autentificat la activitate. " +
                      "Eșuează dacă activitatea este în trecut, plină, privată (și nu ești organizatorul) sau ești deja înscris. **Necesită autentificare.**")]
    [SwaggerResponse(204, "Înscris cu succes")]
    [SwaggerResponse(400, "Activitate în trecut")]
    [SwaggerResponse(401, "Neautentificat sau activitate privată")]
    [SwaggerResponse(404, "Activitate inexistentă")]
    [SwaggerResponse(409, "Deja înscris sau activitate plină")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Join(int id)
    {
        var userId = GetCurrentUserId();
        await _participationService.JoinAsync(userId, id);
        return NoContent();
    }

    /// <summary>Părăsește o activitate.</summary>
    [HttpDelete("{id:int}/leave")]
    [SwaggerOperation(
        Summary = "Leave activitate",
        Description = "Marchează participarea utilizatorului curent ca Left. " +
                      "Eșuează dacă nu ești participant activ. **Necesită autentificare.**")]
    [SwaggerResponse(204, "Participare anulată")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(404, "Nu ești parte din această activitate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Leave(int id)
    {
        var userId = GetCurrentUserId();
        await _participationService.LeaveAsync(userId, id);
        return NoContent();
    }

    /// <summary>Returnează lista participanților activi ai unei activități.</summary>
    [HttpGet("{id:int}/participants")]
    [SwaggerOperation(
        Summary = "Participanți activitate",
        Description = "Returnează toți utilizatorii cu participare activă la activitate. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Pagină participanți", typeof(PagedResult<UserDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserDto>>> GetParticipants(int id, [FromQuery] PaginationQuery pagination)
    {
        var participants = await _participationService.GetParticipantsAsync(id, pagination);
        return Ok(participants);
    }

    /// <summary>Elimină un participant dintr-o activitate.</summary>
    [HttpPost("{id:int}/participants/{userId:int}/remove")]
    [SwaggerOperation(
        Summary = "Elimină participant",
        Description = "Permite organizatorului să elimine un participant activ din activitate. **Necesită autentificare.**")]
    [SwaggerResponse(204, "Participant eliminat")]
    [SwaggerResponse(401, "Neautentificat sau nu ești organizatorul")]
    [SwaggerResponse(404, "Activitate inexistentă sau participant nu e activ")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveParticipant(int id, int userId)
    {
        var organizerId = GetCurrentUserId();
        await _participationService.RemoveParticipantAsync(organizerId, id, userId);
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
