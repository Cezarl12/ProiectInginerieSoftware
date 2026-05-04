using SportMap.Models.Common;
using SportMap.Models.DTOs.Activities;

namespace SportMap.Core.Interfaces.Services;

public interface IActivityService
{
    Task<PagedResult<ActivityDto>> GetAllAsync(ActivityFilterDto filter, int currentUserId, PaginationQuery pagination);
    Task<ActivityDto?> GetByIdAsync(int id, int currentUserId);
    Task<IEnumerable<ActivityDto>> GetOrganizedByUserAsync(int userId);
    Task<IEnumerable<ActivityDto>> GetJoinedByUserAsync(int userId);
    Task<ActivityDto> CreateAsync(int organizerId, CreateActivityDto dto);
    Task<ActivityDto> UpdateAsync(int activityId, int requestingUserId, UpdateActivityDto dto);
    Task DeleteAsync(int activityId, int requestingUserId);
    Task<IEnumerable<ActivityDto>> GetByUserIdAsync(int userId);
}
