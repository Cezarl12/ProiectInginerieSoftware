using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Infrastructure.Data;

namespace SportMap.Infrastructure.Repositories;

public class ParticipationRepository : IParticipationRepository
{
    private readonly SportMapDbContext _context;

    public ParticipationRepository(SportMapDbContext context)
    {
        _context = context;
    }

    public async Task<Participation?> GetByIdAsync(int id) =>
        await _context.Participations.FindAsync(id);

    public async Task<Participation?> GetActiveAsync(int userId, int activityId) =>
        await _context.Participations
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ActivityId == activityId && p.Status == ParticipationStatus.Active);

    public async Task<Participation?> GetAnyAsync(int userId, int activityId) =>
        await _context.Participations
            .FirstOrDefaultAsync(p => p.UserId == userId && p.ActivityId == activityId);

    public async Task<(IEnumerable<Participation> Items, int TotalCount)> GetActiveByActivityAsync(int activityId, int page, int pageSize)
    {
        var query = _context.Participations
            .AsNoTracking()
            .Where(p => p.ActivityId == activityId && p.Status == ParticipationStatus.Active);
        var total = await query.CountAsync();
        var items = await query
            .Include(p => p.User)
            .OrderBy(p => p.JoinedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, total);
    }

    public async Task<IEnumerable<Activity>> GetJoinedActivitiesAsync(int userId) =>
        await _context.Activities
            .AsNoTracking()
            .Include(a => a.Organizer)
            .Include(a => a.Location)
            .Include(a => a.Participations)
            .Where(a => a.Participations.Any(p => p.UserId == userId && p.Status == ParticipationStatus.Active))
            .OrderByDescending(a => a.DateTime)
            .ToListAsync();

    public async Task<int> CountActiveByActivityAsync(int activityId) =>
        await _context.Participations
            .CountAsync(p => p.ActivityId == activityId && p.Status == ParticipationStatus.Active);

    public async Task<Participation> AddAsync(Participation participation)
    {
        _context.Participations.Add(participation);
        await _context.SaveChangesAsync();
        return participation;
    }

    public async Task UpdateAsync(Participation participation)
    {
        _context.Participations.Update(participation);
        await _context.SaveChangesAsync();
    }
}
