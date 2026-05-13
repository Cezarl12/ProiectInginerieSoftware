using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Infrastructure.Data;
using SportMap.Models.DTOs.Activities;

namespace SportMap.Infrastructure.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly SportMapDbContext _context;

    public ActivityRepository(SportMapDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Activity>> GetAllAsync(ActivityFilterDto filter)
    {
        var query = _context.Activities
            .AsNoTracking()
            .Include(a => a.Organizer)
            .Include(a => a.Location)
            .Include(a => a.Participations)
            .AsQueryable();

        // Only show upcoming activities in the discovery list.
        // Past activities are preserved in the DB for user history.
        query = query.Where(a => a.DateTime >= DateTime.UtcNow);

        if (!string.IsNullOrWhiteSpace(filter.Sport))
            query = query.Where(a => a.Sport.ToLower().Contains(filter.Sport.ToLower()));

        if (filter.Type.HasValue)
            query = query.Where(a => a.Type == filter.Type.Value);

        if (filter.FromDate.HasValue)
            query = query.Where(a => a.DateTime >= filter.FromDate.Value);

        if (filter.ToDate.HasValue)
            query = query.Where(a => a.DateTime <= filter.ToDate.Value);

        if (filter.LocationId.HasValue)
            query = query.Where(a => a.LocationId == filter.LocationId.Value);

        return await query.OrderBy(a => a.DateTime).ToListAsync();
    }

    public async Task<Activity?> GetByIdAsync(int id) =>
        await _context.Activities.FindAsync(id);

    public async Task<Activity?> GetByIdWithDetailsAsync(int id) =>
        await _context.Activities
            .AsNoTracking()
            .Include(a => a.Organizer)
            .Include(a => a.Location)
            .Include(a => a.Participations)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<IEnumerable<Activity>> GetOrganizedByUserAsync(int userId) =>
        await _context.Activities
            .AsNoTracking()
            .Include(a => a.Organizer)
            .Include(a => a.Location)
            .Include(a => a.Participations)
            .Where(a => a.OrganizerId == userId)
            .OrderByDescending(a => a.DateTime)
            .ToListAsync();

    public async Task<IEnumerable<Activity>> GetJoinedByUserAsync(int userId) =>
        await _context.Activities
            .AsNoTracking()
            .Include(a => a.Organizer)
            .Include(a => a.Location)
            .Include(a => a.Participations)
            .Where(a => a.Participations.Any(p => p.UserId == userId && p.Status == ParticipationStatus.Active))
            .OrderByDescending(a => a.DateTime)
            .ToListAsync();

    public async Task<Activity> AddAsync(Activity activity)
    {
        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();
        return activity;
    }

    public async Task UpdateAsync(Activity activity)
    {
        _context.Activities.Update(activity);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var activity = await _context.Activities.FindAsync(id);
        if (activity is not null)
        {
            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
        }
    }
}
