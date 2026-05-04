using SportMap.Models.Common;
using SportMap.Models.DTOs.Users;

namespace SportMap.Core.Interfaces.Services;

public interface IParticipationService
{
    Task JoinAsync(int userId, int activityId);
    Task LeaveAsync(int userId, int activityId);
    Task RemoveParticipantAsync(int organizerId, int activityId, int targetUserId);
    Task<PagedResult<UserDto>> GetParticipantsAsync(int activityId, PaginationQuery pagination);
}
