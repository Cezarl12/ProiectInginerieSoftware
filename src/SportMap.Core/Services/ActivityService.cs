using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.DTOs.Activities;

namespace SportMap.Core.Services;

public class ActivityService : IActivityService
{
    private readonly IActivityRepository _activityRepository;

    public ActivityService(IActivityRepository activityRepository)
    {
        _activityRepository = activityRepository;
    }

    public async Task<IEnumerable<ActivityDto>> GetByUserIdAsync(int userId)
    {
        var activities = await _activityRepository.GetByUserIdAsync(userId);
        return activities.Select(a => new ActivityDto
        {
            Id = a.Id,
            Title = a.Title,
            Sport = a.Sport,
            DateTime = a.DateTime,
            MaxParticipants = a.MaxParticipants,
            Type = a.Type,
            OrganizerId = a.OrganizerId,
            LocationId = a.LocationId,
            ParticipantCount = a.Participations.Count,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        });
    }
}
