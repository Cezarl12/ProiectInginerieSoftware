using SportMap.Core.Entities;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.Common;
using SportMap.Models.DTOs.Activities;
using SportMap.Models.DTOs.Users;
using SportMap.Models.Enums;

namespace SportMap.Core.Services;

public class FriendshipService : IFriendshipService
{
    private readonly IFriendshipRepository _friendshipRepository;
    private readonly IUserRepository _userRepository;
    private readonly IActivityService _activityService;

    public FriendshipService(
        IFriendshipRepository friendshipRepository,
        IUserRepository userRepository,
        IActivityService activityService)
    {
        _friendshipRepository = friendshipRepository;
        _userRepository = userRepository;
        _activityService = activityService;
    }

    public async Task FollowAsync(int currentUserId, int targetUserId)
    {
        if (currentUserId == targetUserId)
            throw new ValidationException("Cannot follow yourself.");

        _ = await _userRepository.GetByIdAsync(targetUserId)
            ?? throw new NotFoundException($"User with ID {targetUserId} not found.");

        if (await _friendshipRepository.ExistsAsync(currentUserId, targetUserId))
            throw new ConflictException("Already following.");

        await _friendshipRepository.AddAsync(new Friendship
        {
            FollowerId = currentUserId,
            FolloweeId = targetUserId,
            CreatedAt = DateTime.UtcNow
        });
    }

    public async Task UnfollowAsync(int currentUserId, int targetUserId)
    {
        if (!await _friendshipRepository.ExistsAsync(currentUserId, targetUserId))
            throw new NotFoundException("You are not following this user.");

        await _friendshipRepository.DeleteAsync(currentUserId, targetUserId);
    }

    public async Task<PagedResult<UserDto>> GetMyFolloweesAsync(int currentUserId, PaginationQuery pagination)
    {
        var (followees, total) = await _friendshipRepository.GetFolloweesAsync(currentUserId, pagination.Page, pagination.PageSize);
        return new PagedResult<UserDto>
        {
            Items = followees.Select(MapToUserDto),
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        };
    }

    public async Task<PagedResult<UserDto>> GetFollowersOfAsync(int userId, PaginationQuery pagination)
    {
        var (followers, total) = await _friendshipRepository.GetFollowersAsync(userId, pagination.Page, pagination.PageSize);
        return new PagedResult<UserDto>
        {
            Items = followers.Select(MapToUserDto),
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        };
    }

    public async Task<PagedResult<UserDto>> GetUserFolloweesAsync(int userId, PaginationQuery pagination)
    {
        var (followees, total) = await _friendshipRepository.GetFolloweesAsync(userId, pagination.Page, pagination.PageSize);
        return new PagedResult<UserDto>
        {
            Items = followees.Select(MapToUserDto),
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        };
    }

    public async Task<bool> IsFollowingAsync(int currentUserId, int targetUserId)
        => await _friendshipRepository.ExistsAsync(currentUserId, targetUserId);

    public async Task<IEnumerable<ActivityDto>> GetUserActivitiesAsync(int currentUserId, int targetUserId)
    {
        var activities = await _activityService.GetOrganizedByUserAsync(targetUserId);
        var followeeIds = await _friendshipRepository.GetFolloweeIdsAsync(currentUserId);
        bool canSeePrivate = currentUserId == targetUserId || followeeIds.Contains(targetUserId);
        return activities.Where(a => a.Type == ActivityType.Public || canSeePrivate);
    }

    private static UserDto MapToUserDto(User u) => new()
    {
        Id = u.Id,
        Username = u.Username,
        Email = u.Email,
        ProfilePhotoUrl = u.ProfilePhotoUrl,
        FavoriteSports = u.FavoriteSports,
        CreatedAt = u.CreatedAt,
        Role = u.Role.ToString()
    };
}
