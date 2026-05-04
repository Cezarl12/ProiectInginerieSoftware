using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Infrastructure.Data;
using SportMap.Models.Enums;

namespace SportMap.Infrastructure.Repositories;

public class LocationRepository : ILocationRepository
{
    private readonly SportMapDbContext _context;

    public LocationRepository(SportMapDbContext context)
    {
        _context = context;
    }

    public async Task<Location?> GetByIdAsync(int id) =>
        await _context.Locations
            .Include(l => l.ProposedBy)
            .FirstOrDefaultAsync(l => l.Id == id);

    public async Task<(IEnumerable<Location> Items, int TotalCount)> GetAllAsync(string? sport, LocationStatus? status, int page, int pageSize)
    {
        var query = _context.Locations
            .AsNoTracking()
            .Include(l => l.ProposedBy)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(sport))
            query = query.Where(l => l.Sports.Contains(sport));

        if (status.HasValue)
            query = query.Where(l => l.Status == status.Value);

        var total = await query.CountAsync();
        var items = await query.OrderBy(l => l.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, total);
    }

    public async Task<IEnumerable<Location>> GetNearbyAsync(double lat, double lng, double radiusKm)
    {
        var latDelta = (decimal)(radiusKm / 111.0);
        var lngDelta = (decimal)(radiusKm / (111.0 * Math.Cos(lat * Math.PI / 180.0)));
        var decLat = (decimal)lat;
        var decLng = (decimal)lng;

        var candidates = await _context.Locations
            .AsNoTracking()
            .Include(l => l.ProposedBy)
            .Where(l =>
                l.Status == LocationStatus.Approved &&
                l.Latitude >= decLat - latDelta && l.Latitude <= decLat + latDelta &&
                l.Longitude >= decLng - lngDelta && l.Longitude <= decLng + lngDelta)
            .ToListAsync();

        return candidates
            .Select(l => (location: l, dist: Haversine((double)l.Latitude, (double)l.Longitude, lat, lng)))
            .Where(x => x.dist <= radiusKm)
            .OrderBy(x => x.dist)
            .Select(x => x.location)
            .ToList();
    }

    public async Task<Location> AddAsync(Location location)
    {
        _context.Locations.Add(location);
        await _context.SaveChangesAsync();
        return location;
    }

    public async Task UpdateAsync(Location location)
    {
        _context.Locations.Update(location);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var location = await _context.Locations.FindAsync(id);
        if (location is not null)
        {
            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();
        }
    }

    private static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;
}
