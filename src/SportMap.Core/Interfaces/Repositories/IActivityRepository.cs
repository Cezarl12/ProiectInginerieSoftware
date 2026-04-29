using SportMap.Core.Entities;

namespace SportMap.Core.Interfaces.Repositories;

public interface IActivityRepository
{
    Task<IEnumerable<Activity>> GetByUserIdAsync(int userId);
}
