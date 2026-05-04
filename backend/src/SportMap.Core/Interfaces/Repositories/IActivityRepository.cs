using SportMap.Core.Entities;
using SportMap.Models.DTOs.Activities;

namespace SportMap.Core.Interfaces.Repositories;

public interface IActivityRepository
{
    Task<IEnumerable<Activity>> GetAllAsync(ActivityFilterDto filter);
    Task<Activity?> GetByIdAsync(int id);
    Task<Activity?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Activity>> GetOrganizedByUserAsync(int userId);
    Task<IEnumerable<Activity>> GetJoinedByUserAsync(int userId);
    Task<Activity> AddAsync(Activity activity);
    Task UpdateAsync(Activity activity);
    Task DeleteAsync(int id);
}
