using SportMap.Models.Common;
using SportMap.Models.DTOs.Activities;
using SportMap.Models.DTOs.Users;

namespace SportMap.Core.Interfaces.Services;

public interface IFriendshipService
{
    Task FollowAsync(int currentUserId, int targetUserId);
    Task UnfollowAsync(int currentUserId, int targetUserId);
    Task<PagedResult<UserDto>> GetMyFolloweesAsync(int currentUserId, PaginationQuery pagination);
    Task<PagedResult<UserDto>> GetFollowersOfAsync(int userId, PaginationQuery pagination);
    Task<IEnumerable<ActivityDto>> GetUserActivitiesAsync(int currentUserId, int targetUserId);
}
