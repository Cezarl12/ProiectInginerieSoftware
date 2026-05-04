using SportMap.Core.Entities;

namespace SportMap.Core.Interfaces.Repositories;

public interface IParticipationRepository
{
    Task<Participation?> GetByIdAsync(int id);
    Task<Participation?> GetActiveAsync(int userId, int activityId);
    Task<Participation?> GetAnyAsync(int userId, int activityId);
    Task<(IEnumerable<Participation> Items, int TotalCount)> GetActiveByActivityAsync(int activityId, int page, int pageSize);
    Task<IEnumerable<Activity>> GetJoinedActivitiesAsync(int userId);
    Task<int> CountActiveByActivityAsync(int activityId);
    Task<Participation> AddAsync(Participation participation);
    Task UpdateAsync(Participation participation);
}
