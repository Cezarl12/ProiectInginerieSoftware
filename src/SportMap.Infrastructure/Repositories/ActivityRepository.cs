using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Infrastructure.Data;

namespace SportMap.Infrastructure.Repositories;

public class ActivityRepository : IActivityRepository
{
    private readonly SportMapDbContext _context;

    public ActivityRepository(SportMapDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Activity>> GetByUserIdAsync(int userId) =>
        await _context.Activities
            .AsNoTracking()
            .Include(a => a.Participations)
            .Where(a => a.OrganizerId == userId)
            .OrderByDescending(a => a.DateTime)
            .ToListAsync();
}
