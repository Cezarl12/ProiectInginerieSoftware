using SportMap.Models.DTOs.Activities;

namespace SportMap.Core.Interfaces.Services;

public interface IActivityService
{
    Task<IEnumerable<ActivityDto>> GetByUserIdAsync(int userId);
}
