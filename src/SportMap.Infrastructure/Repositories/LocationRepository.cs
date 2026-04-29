using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Infrastructure.Data;

namespace SportMap.Infrastructure.Repositories;

public class LocationRepository : ILocationRepository
{
    private readonly SportMapDbContext _context;

    public LocationRepository(SportMapDbContext context)
    {
        _context = context;
    }

    public async Task<Location?> GetByIdAsync(int id) =>
        await _context.Locations.FindAsync(id);
}
