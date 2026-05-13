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

/// <summary>Sistem de urmărire asimetrică între utilizatori (follow/unfollow).</summary>
[ApiController]
[Route("api/friends")]
[Authorize]
[Tags("Friends")]
public class FriendsController : ControllerBase
{
    private readonly IFriendshipService _friendshipService;

    public FriendsController(IFriendshipService friendshipService)
    {
        _friendshipService = friendshipService;
    }

    /// <summary>Listează utilizatorii urmăriți de utilizatorul curent.</summary>
    [HttpGet]
    [SwaggerOperation(
        Summary = "Lista mea de followees",
        Description = "Returnează utilizatorii pe care utilizatorul curent îi urmărește. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Pagină followees", typeof(PagedResult<UserDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserDto>>> GetMyFollowees([FromQuery] PaginationQuery pagination)
    {
        var userId = GetCurrentUserId();
        return Ok(await _friendshipService.GetMyFolloweesAsync(userId, pagination));
    }

    /// <summary>Urmărește un utilizator.</summary>
    [HttpPost("{userId:int}")]
    [SwaggerOperation(
        Summary = "Follow utilizator",
        Description = "Adaugă o relație de urmărire față de utilizatorul specificat. **Necesită autentificare.**")]
    [SwaggerResponse(204, "Urmărire adăugată cu succes")]
    [SwaggerResponse(400, "Încerci să te urmărești pe tine însuți")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(404, "Utilizator inexistent")]
    [SwaggerResponse(409, "Urmărești deja acest utilizator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Follow(int userId)
    {
        var currentUserId = GetCurrentUserId();
        await _friendshipService.FollowAsync(currentUserId, userId);
        return NoContent();
    }

    /// <summary>Încetează urmărirea unui utilizator.</summary>
    [HttpDelete("{userId:int}")]
    [SwaggerOperation(
        Summary = "Unfollow utilizator",
        Description = "Elimină relația de urmărire față de utilizatorul specificat. **Necesită autentificare.**")]
    [SwaggerResponse(204, "Urmărire eliminată cu succes")]
    [SwaggerResponse(401, "Neautentificat")]
    [SwaggerResponse(404, "Nu urmărești acest utilizator")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Unfollow(int userId)
    {
        var currentUserId = GetCurrentUserId();
        await _friendshipService.UnfollowAsync(currentUserId, userId);
        return NoContent();
    }

    /// <summary>Verifică dacă utilizatorul curent urmărește un alt utilizator.</summary>
    [HttpGet("{userId:int}/is-following")]
    [SwaggerOperation(Summary = "Status urmărire", Description = "Returnează dacă utilizatorul curent urmărește utilizatorul specificat. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Status urmărire", typeof(object))]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> IsFollowing(int userId)
    {
        var currentUserId = GetCurrentUserId();
        var isFollowing = await _friendshipService.IsFollowingAsync(currentUserId, userId);
        return Ok(new { isFollowing });
    }

    /// <summary>Returnează utilizatorii urmăriți de un utilizator specificat.</summary>
    [HttpGet("/api/users/{userId:int}/following")]
    [SwaggerOperation(Summary = "Following unui utilizator", Description = "Returnează lista utilizatorilor urmăriți de utilizatorul specificat. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Pagină following", typeof(PagedResult<UserDto>))]
    [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserDto>>> GetFollowing(int userId, [FromQuery] PaginationQuery pagination)
        => Ok(await _friendshipService.GetUserFolloweesAsync(userId, pagination));

    /// <summary>Returnează urmăritorii unui utilizator.</summary>
    [HttpGet("/api/users/{userId:int}/followers")]
    [SwaggerOperation(
        Summary = "Urmăritorii unui utilizator",
        Description = "Returnează lista utilizatorilor care urmăresc utilizatorul specificat. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Pagină followers", typeof(PagedResult<UserDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(PagedResult<UserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<UserDto>>> GetFollowers(int userId, [FromQuery] PaginationQuery pagination)
    {
        return Ok(await _friendshipService.GetFollowersOfAsync(userId, pagination));
    }

    /// <summary>Returnează activitățile vizibile ale unui utilizator.</summary>
    [HttpGet("{userId:int}/activities")]
    [SwaggerOperation(
        Summary = "Activitățile unui utilizator urmărit",
        Description = "Returnează activitățile organizate de utilizatorul specificat, filtrate după regulile de privacy. " +
                      "Activitățile private sunt vizibile doar dacă urmărești utilizatorul sau ești tu însuți. **Necesită autentificare.**")]
    [SwaggerResponse(200, "Lista activităților vizibile", typeof(IEnumerable<ActivityDto>))]
    [SwaggerResponse(401, "Neautentificat")]
    [ProducesResponseType(typeof(IEnumerable<ActivityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> GetUserActivities(int userId)
    {
        var currentUserId = GetCurrentUserId();
        var activities = await _friendshipService.GetUserActivitiesAsync(currentUserId, userId);
        return Ok(activities);
    }

    private int GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        if (int.TryParse(sub, out var id)) return id;
        throw new UnauthorizedException("Invalid token: missing or malformed user identifier.");
    }
}
