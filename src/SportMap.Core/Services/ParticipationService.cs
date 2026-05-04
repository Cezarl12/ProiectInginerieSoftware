using SportMap.Core.Entities;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.Common;
using SportMap.Models.DTOs.Users;
using SportMap.Models.Enums;

namespace SportMap.Core.Services;

public class ParticipationService : IParticipationService
{
    private readonly IParticipationRepository _participationRepository;
    private readonly IActivityRepository _activityRepository;
    private readonly IFriendshipRepository _friendshipRepository;

    public ParticipationService(
        IParticipationRepository participationRepository,
        IActivityRepository activityRepository,
        IFriendshipRepository friendshipRepository)
    {
        _participationRepository = participationRepository;
        _activityRepository = activityRepository;
        _friendshipRepository = friendshipRepository;
    }

    public async Task JoinAsync(int userId, int activityId)
    {
        var activity = await _activityRepository.GetByIdAsync(activityId)
            ?? throw new NotFoundException($"Activity with ID {activityId} not found.");

        if (activity.DateTime <= DateTime.UtcNow)
            throw new ValidationException("Cannot join past activities.");

        var active = await _participationRepository.GetActiveAsync(userId, activityId);
        if (active is not null)
            throw new ConflictException("Already joined.");

        var count = await _participationRepository.CountActiveByActivityAsync(activityId);
        if (count >= activity.MaxParticipants)
            throw new ConflictException("Activity is full.");

        if (activity.Type == ActivityType.Private && userId != activity.OrganizerId)
        {
            if (!await _friendshipRepository.ExistsAsync(userId, activity.OrganizerId))
                throw new UnauthorizedException("This activity is private. Follow the organizer to join.");
        }

        var existing = await _participationRepository.GetAnyAsync(userId, activityId);
        if (existing is not null)
        {
            existing.Status = ParticipationStatus.Active;
            existing.JoinedAt = DateTime.UtcNow;
            await _participationRepository.UpdateAsync(existing);
        }
        else
        {
            await _participationRepository.AddAsync(new Participation
            {
                UserId = userId,
                ActivityId = activityId,
                JoinedAt = DateTime.UtcNow,
                Status = ParticipationStatus.Active
            });
        }
    }

    public async Task LeaveAsync(int userId, int activityId)
    {
        var participation = await _participationRepository.GetActiveAsync(userId, activityId)
            ?? throw new NotFoundException("You are not part of this activity.");

        participation.Status = ParticipationStatus.Left;
        await _participationRepository.UpdateAsync(participation);
    }

    public async Task RemoveParticipantAsync(int organizerId, int activityId, int targetUserId)
    {
        var activity = await _activityRepository.GetByIdAsync(activityId)
            ?? throw new NotFoundException($"Activity with ID {activityId} not found.");

        if (activity.OrganizerId != organizerId)
            throw new UnauthorizedException("Only the organizer can remove participants.");

        var participation = await _participationRepository.GetActiveAsync(targetUserId, activityId)
            ?? throw new NotFoundException("Participant not found in this activity.");

        participation.Status = ParticipationStatus.Removed;
        await _participationRepository.UpdateAsync(participation);
    }

    public async Task<PagedResult<UserDto>> GetParticipantsAsync(int activityId, PaginationQuery pagination)
    {
        var (participations, total) = await _participationRepository.GetActiveByActivityAsync(activityId, pagination.Page, pagination.PageSize);
        return new PagedResult<UserDto>
        {
            Items = participations
                .Where(p => p.User is not null)
                .Select(p => new UserDto
                {
                    Id = p.User!.Id,
                    Username = p.User.Username,
                    Email = p.User.Email,
                    ProfilePhotoUrl = p.User.ProfilePhotoUrl,
                    FavoriteSports = p.User.FavoriteSports,
                    CreatedAt = p.User.CreatedAt,
                    Role = p.User.Role.ToString()
                }),
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        };
    }
}
