using SportMap.Models.Common;
using SportMap.Models.DTOs.Locations;
using SportMap.Models.Enums;

namespace SportMap.Core.Interfaces.Services;

public interface ILocationService
{
    Task<LocationDto?> GetByIdAsync(int id);
    Task<PagedResult<LocationDto>> GetAllAsync(string? sport, LocationStatus? status, PaginationQuery pagination);
    Task<IEnumerable<LocationDto>> GetNearbyAsync(double lat, double lng, double radiusKm);
    Task<LocationDto> CreateAsync(int proposedByUserId, CreateLocationDto dto);
    Task<LocationDto> UpdateAsync(int id, int currentUserId, UpdateLocationDto dto);
    Task DeleteAsync(int id, int currentUserId);
    Task<LocationDto> ApproveAsync(int id);
    Task<LocationDto> RejectAsync(int id);
}
