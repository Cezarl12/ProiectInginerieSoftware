using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.DTOs.Activities;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace SportMap.API.Controllers;

/// <summary>Gestionarea activităților sportive.</summary>
[ApiController]
[Route("api/activities")]
[Authorize]
[Tags("Activities")]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivitiesController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    /// <summary>Listează activitățile cu filtre opționale.</summary>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Listă activități",
        Description = "Returnează toate activitățile, cu filtrare opțională după sport, tip, interval de date și locație. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Listă activități", typeof(IEnumerable<ActivityDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetAll([FromQuery] ActivityFilterDto filter)
    {
        var activities = await _activityService.GetAllAsync(filter);
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
        Description = "Returnează activitatea cu Organizer și Location incluse. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Activitate găsită", typeof(ActivityDto))]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(404, "Activitate inexistentă")]
    [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ActivityDto>> GetById(int id)
    {
        var activity = await _activityService.GetByIdAsync(id);
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

    private int GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        if (int.TryParse(sub, out var id)) return id;
        throw new UnauthorizedException("Invalid token: missing or malformed user identifier.");
    }
}
