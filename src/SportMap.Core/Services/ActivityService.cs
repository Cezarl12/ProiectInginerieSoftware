using SportMap.Core.Entities;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.DTOs.Activities;
using SportMap.Models.DTOs.Locations;
using SportMap.Models.DTOs.Users;
using SportMap.Models.Enums;

namespace SportMap.Core.Services;

public class ActivityService : IActivityService
{
    private readonly IActivityRepository _activityRepository;
    private readonly ILocationRepository _locationRepository;

    public ActivityService(IActivityRepository activityRepository, ILocationRepository locationRepository)
    {
        _activityRepository = activityRepository;
        _locationRepository = locationRepository;
    }

    public async Task<IEnumerable<ActivityDto>> GetAllAsync(ActivityFilterDto filter)
    {
        var activities = await _activityRepository.GetAllAsync(filter);
        return activities.Select(MapToDto);
    }

    public async Task<ActivityDto?> GetByIdAsync(int id)
    {
        var activity = await _activityRepository.GetByIdWithDetailsAsync(id);
        return activity is null ? null : MapToDto(activity);
    }

    public async Task<IEnumerable<ActivityDto>> GetOrganizedByUserAsync(int userId)
    {
        var activities = await _activityRepository.GetOrganizedByUserAsync(userId);
        return activities.Select(MapToDto);
    }

    public async Task<IEnumerable<ActivityDto>> GetJoinedByUserAsync(int userId)
    {
        var activities = await _activityRepository.GetJoinedByUserAsync(userId);
        return activities.Select(MapToDto);
    }

    public async Task<ActivityDto> CreateAsync(int organizerId, CreateActivityDto dto)
    {
        if (dto.DateTime <= DateTime.UtcNow)
            throw new ValidationException("Activity DateTime must be in the future.");

        var location = await _locationRepository.GetByIdAsync(dto.LocationId)
            ?? throw new NotFoundException($"Location with ID {dto.LocationId} not found.");

        if (location.Status != LocationStatus.Approved)
            throw new ValidationException("Location must be approved before activities can be created there.");

        var activity = new Activity
        {
            Title = dto.Title,
            Sport = dto.Sport,
            DateTime = dto.DateTime,
            MaxParticipants = dto.MaxParticipants,
            Type = dto.Type,
            Description = dto.Description,
            OrganizerId = organizerId,
            LocationId = dto.LocationId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _activityRepository.AddAsync(activity);
        return MapToDto((await _activityRepository.GetByIdWithDetailsAsync(created.Id))!);
    }

    public async Task<ActivityDto> UpdateAsync(int activityId, int requestingUserId, UpdateActivityDto dto)
    {
        var activity = await _activityRepository.GetByIdAsync(activityId)
            ?? throw new NotFoundException($"Activity with ID {activityId} not found.");

        if (activity.OrganizerId != requestingUserId)
            throw new ForbiddenException("Only the organizer can update this activity.");

        if (dto.DateTime.HasValue && dto.DateTime.Value <= DateTime.UtcNow)
            throw new ValidationException("Activity DateTime must be in the future.");

        if (dto.LocationId.HasValue)
        {
            var location = await _locationRepository.GetByIdAsync(dto.LocationId.Value)
                ?? throw new NotFoundException($"Location with ID {dto.LocationId.Value} not found.");

            if (location.Status != LocationStatus.Approved)
                throw new ValidationException("Location must be approved before activities can be created there.");

            activity.LocationId = dto.LocationId.Value;
        }

        if (dto.Title is not null) activity.Title = dto.Title;
        if (dto.Sport is not null) activity.Sport = dto.Sport;
        if (dto.DateTime.HasValue) activity.DateTime = dto.DateTime.Value;
        if (dto.MaxParticipants.HasValue) activity.MaxParticipants = dto.MaxParticipants.Value;
        if (dto.Type.HasValue) activity.Type = dto.Type.Value;
        if (dto.Description is not null) activity.Description = dto.Description;
        activity.UpdatedAt = DateTime.UtcNow;

        await _activityRepository.UpdateAsync(activity);
        return MapToDto((await _activityRepository.GetByIdWithDetailsAsync(activityId))!);
    }

    public async Task DeleteAsync(int activityId, int requestingUserId)
    {
        var activity = await _activityRepository.GetByIdAsync(activityId)
            ?? throw new NotFoundException($"Activity with ID {activityId} not found.");

        if (activity.OrganizerId != requestingUserId)
            throw new ForbiddenException("Only the organizer can delete this activity.");

        await _activityRepository.DeleteAsync(activityId);
    }

    public async Task<IEnumerable<ActivityDto>> GetByUserIdAsync(int userId) =>
        await GetOrganizedByUserAsync(userId);

    private static ActivityDto MapToDto(Activity a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Sport = a.Sport,
        DateTime = a.DateTime,
        MaxParticipants = a.MaxParticipants,
        Type = a.Type,
        Description = a.Description,
        OrganizerId = a.OrganizerId,
        LocationId = a.LocationId,
        ParticipantCount = a.Participations.Count,
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt,
        Organizer = a.Organizer is null ? null : new UserDto
        {
            Id = a.Organizer.Id,
            Username = a.Organizer.Username,
            Email = a.Organizer.Email,
            ProfilePhotoUrl = a.Organizer.ProfilePhotoUrl,
            FavoriteSports = a.Organizer.FavoriteSports,
            CreatedAt = a.Organizer.CreatedAt
        },
        Location = a.Location is null ? null : new LocationDto
        {
            Id = a.Location.Id,
            Name = a.Location.Name,
            Address = a.Location.Address,
            Latitude = a.Location.Latitude,
            Longitude = a.Location.Longitude,
            Status = a.Location.Status,
            CreatedAt = a.Location.CreatedAt
        }
    };
}
