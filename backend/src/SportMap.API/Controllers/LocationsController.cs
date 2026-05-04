using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.Common;
using SportMap.Models.DTOs.Locations;
using SportMap.Models.Enums;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;

namespace SportMap.API.Controllers;

/// <summary>Gestionarea locațiilor sportive.</summary>
[ApiController]
[Route("api/locations")]
[Tags("Locations")]
public class LocationsController : ControllerBase
{
    private readonly ILocationService _locationService;

    public LocationsController(ILocationService locationService)
    {
        _locationService = locationService;
    }

    /// <summary>Listează locațiile cu filtre opționale.</summary>
    [HttpGet]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Listă locații",
        Description = "Returnează locațiile filtrate opțional după sport sau status. Suportă paginare.")]
    [SwaggerResponse(200, "Pagină locații", typeof(PagedResult<LocationDto>))]
    [ProducesResponseType(typeof(PagedResult<LocationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<LocationDto>>> GetAll(
        [FromQuery] string? sport,
        [FromQuery] LocationStatus? status,
        [FromQuery] PaginationQuery pagination)
    {
        var result = await _locationService.GetAllAsync(sport, status, pagination);
        return Ok(result);
    }

    /// <summary>Returnează detaliile unei locații după ID.</summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Detalii locație",
        Description = "Returnează locația identificată prin ID numeric.")]
    [SwaggerResponse(200, "Locație găsită", typeof(LocationDto))]
    [SwaggerResponse(404, "Locație inexistentă")]
    [ProducesResponseType(typeof(LocationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LocationDto>> GetById(int id)
    {
        var location = await _locationService.GetByIdAsync(id);
        return location is null ? NotFound() : Ok(location);
    }

    /// <summary>Returnează locațiile aprobate în raza specificată.</summary>
    [HttpGet("nearby")]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Locații apropiate",
        Description = "Returnează locațiile aprobate în raza (km) față de coordonatele date, ordonate ascendent după distanță.")]
    [SwaggerResponse(200, "Locații apropiate cu DistanceKm populat", typeof(IEnumerable<LocationDto>))]
    [SwaggerResponse(400, "Parametri invalizi")]
    [ProducesResponseType(typeof(IEnumerable<LocationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IEnumerable<LocationDto>>> GetNearby(
        [FromQuery] double lat,
        [FromQuery] double lng,
        [FromQuery] double radiusKm = 5)
    {
        if (lat < -90 || lat > 90)
            return BadRequest(new { error = "lat must be between -90 and 90." });
        if (lng < -180 || lng > 180)
            return BadRequest(new { error = "lng must be between -180 and 180." });
        if (radiusKm <= 0 || radiusKm > 100)
            return BadRequest(new { error = "radiusKm must be between 0 and 100." });

        var locations = await _locationService.GetNearbyAsync(lat, lng, radiusKm);
        return Ok(locations);
    }

    /// <summary>Propune o locație nouă.</summary>
    [HttpPost]
    [Authorize]
    [SwaggerOperation(
        Summary = "Propunere locație",
        Description = "Creează o locație cu Status=Pending. ProposedByUserId setat automat din JWT. **Necesită autentificare.**")]
    [SwaggerResponse(201, "Locație creată", typeof(LocationDto))]
    [SwaggerResponse(400, "Date invalide")]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(LocationDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LocationDto>> Create([FromBody] CreateLocationDto dto)
    {
        var userId = GetCurrentUserId();
        var created = await _locationService.CreateAsync(userId, dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>Actualizează o locație propusă.</summary>
    [HttpPut("{id:int}")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Actualizare locație",
        Description = "Modifică datele locației. Câmpurile null sunt ignorate. Doar utilizatorul care a propus-o poate modifica. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Locație actualizată", typeof(LocationDto))]
    [SwaggerResponse(401, "Neautentificat sau nu ești proprietarul locației")]
    [SwaggerResponse(404, "Locație inexistentă")]
    [ProducesResponseType(typeof(LocationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LocationDto>> Update(int id, [FromBody] UpdateLocationDto dto)
    {
        var userId = GetCurrentUserId();
        var updated = await _locationService.UpdateAsync(id, userId, dto);
        return Ok(updated);
    }

    /// <summary>Șterge o locație propusă.</summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    [SwaggerOperation(
        Summary = "Ștergere locație",
        Description = "Șterge definitiv locația. Doar utilizatorul care a propus-o poate șterge. **Necesită autentificare.**")]
    [SwaggerResponse(204, "Locație ștearsă")]
    [SwaggerResponse(401, "Neautentificat sau nu ești proprietarul locației")]
    [SwaggerResponse(404, "Locație inexistentă")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetCurrentUserId();
        await _locationService.DeleteAsync(id, userId);
        return NoContent();
    }

    /// <summary>Aprobă o locație. [Admin only]</summary>
    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = "Admin")]
    [SwaggerOperation(
        Summary = "Aprobare locație (Admin)",
        Description = "Setează Status=Approved. Locația trebuie să fie Pending. **Necesită rol Admin.**")]
    [SwaggerResponse(200, "Locație aprobată", typeof(LocationDto))]
    [SwaggerResponse(400, "Locația nu este Pending")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(403, "Nu ai rol Admin")]
    [SwaggerResponse(404, "Locație inexistentă")]
    [ProducesResponseType(typeof(LocationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LocationDto>> Approve(int id)
    {
        var approved = await _locationService.ApproveAsync(id);
        return Ok(approved);
    }

    /// <summary>Respinge o locație. [Admin only]</summary>
    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = "Admin")]
    [SwaggerOperation(
        Summary = "Respingere locație (Admin)",
        Description = "Setează Status=Rejected. Locația trebuie să fie Pending. **Necesită rol Admin.**")]
    [SwaggerResponse(200, "Locație respinsă", typeof(LocationDto))]
    [SwaggerResponse(400, "Locația nu este Pending")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(403, "Nu ai rol Admin")]
    [SwaggerResponse(404, "Locație inexistentă")]
    [ProducesResponseType(typeof(LocationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LocationDto>> Reject(int id)
    {
        var rejected = await _locationService.RejectAsync(id);
        return Ok(rejected);
    }

    private int GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        if (int.TryParse(sub, out var id)) return id;
        throw new UnauthorizedException("Invalid token: missing or malformed user identifier.");
    }
}
