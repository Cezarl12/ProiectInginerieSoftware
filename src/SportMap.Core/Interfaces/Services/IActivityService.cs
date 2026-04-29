using SportMap.Models.DTOs.Activities;

namespace SportMap.Core.Interfaces.Services;

public interface IActivityService
{
    Task<IEnumerable<ActivityDto>> GetAllAsync(ActivityFilterDto filter);
    Task<ActivityDto?> GetByIdAsync(int id);
    Task<IEnumerable<ActivityDto>> GetOrganizedByUserAsync(int userId);
    Task<IEnumerable<ActivityDto>> GetJoinedByUserAsync(int userId);
    Task<ActivityDto> CreateAsync(int organizerId, CreateActivityDto dto);
    Task<ActivityDto> UpdateAsync(int activityId, int requestingUserId, UpdateActivityDto dto);
    Task DeleteAsync(int activityId, int requestingUserId);
    Task<IEnumerable<ActivityDto>> GetByUserIdAsync(int userId);
}
