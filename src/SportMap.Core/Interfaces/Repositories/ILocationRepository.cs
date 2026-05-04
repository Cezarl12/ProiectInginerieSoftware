using SportMap.Core.Entities;
using SportMap.Models.Enums;

namespace SportMap.Core.Interfaces.Repositories;

public interface ILocationRepository
{
    Task<Location?> GetByIdAsync(int id);
    Task<(IEnumerable<Location> Items, int TotalCount)> GetAllAsync(string? sport, LocationStatus? status, int page, int pageSize);
    Task<IEnumerable<Location>> GetNearbyAsync(double lat, double lng, double radiusKm);
    Task<Location> AddAsync(Location location);
    Task UpdateAsync(Location location);
    Task DeleteAsync(int id);
}
