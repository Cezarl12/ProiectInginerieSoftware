using SportMap.Core.Entities;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.Common;
using SportMap.Models.DTOs.Locations;
using SportMap.Models.Enums;

namespace SportMap.Core.Services;

public class LocationService : ILocationService
{
    private readonly ILocationRepository _locationRepository;

    public LocationService(ILocationRepository locationRepository)
    {
        _locationRepository = locationRepository;
    }

    public async Task<LocationDto?> GetByIdAsync(int id)
    {
        var location = await _locationRepository.GetByIdAsync(id);
        return location is null ? null : MapToDto(location);
    }

    public async Task<PagedResult<LocationDto>> GetAllAsync(string? sport, LocationStatus? status, PaginationQuery pagination)
    {
        var (locations, total) = await _locationRepository.GetAllAsync(sport, status, pagination.Page, pagination.PageSize);
        return new PagedResult<LocationDto>
        {
            Items = locations.Select(l => MapToDto(l)),
            Page = pagination.Page,
            PageSize = pagination.PageSize,
            TotalCount = total
        };
    }

    public async Task<IEnumerable<LocationDto>> GetNearbyAsync(double lat, double lng, double radiusKm)
    {
        if (lat < -90 || lat > 90)
            throw new ValidationException("Latitude must be between -90 and 90.");
        if (lng < -180 || lng > 180)
            throw new ValidationException("Longitude must be between -180 and 180.");
        if (radiusKm <= 0 || radiusKm > 100)
            throw new ValidationException("radiusKm must be greater than 0 and at most 100.");

        var locations = await _locationRepository.GetNearbyAsync(lat, lng, radiusKm);
        return locations.Select(l =>
            MapToDto(l, Haversine((double)l.Latitude, (double)l.Longitude, lat, lng)));
    }

    public async Task<LocationDto> CreateAsync(int proposedByUserId, CreateLocationDto dto)
    {
        if (dto.Latitude < -90 || dto.Latitude > 90)
            throw new ValidationException("Latitude must be between -90 and 90.");
        if (dto.Longitude < -180 || dto.Longitude > 180)
            throw new ValidationException("Longitude must be between -180 and 180.");

        var location = new Location
        {
            Name = dto.Name,
            Address = dto.Address,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Sports = dto.Sports,
            Surface = dto.Surface,
            HasLights = dto.HasLights,
            MainPhotoUrl = dto.MainPhotoUrl,
            SecondaryPhotoUrls = dto.SecondaryPhotoUrls,
            Details = dto.Details,
            Status = LocationStatus.Pending,
            ProposedByUserId = proposedByUserId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _locationRepository.AddAsync(location);
        return MapToDto((await _locationRepository.GetByIdAsync(created.Id))!);
    }

    public async Task<LocationDto> UpdateAsync(int id, int currentUserId, UpdateLocationDto dto)
    {
        var location = await _locationRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Location with ID {id} not found.");

        if (location.ProposedByUserId != currentUserId)
            throw new UnauthorizedException("You can only modify locations you proposed.");

        if (dto.Latitude.HasValue)
        {
            if (dto.Latitude.Value < -90 || dto.Latitude.Value > 90)
                throw new ValidationException("Latitude must be between -90 and 90.");
            location.Latitude = dto.Latitude.Value;
        }
        if (dto.Longitude.HasValue)
        {
            if (dto.Longitude.Value < -180 || dto.Longitude.Value > 180)
                throw new ValidationException("Longitude must be between -180 and 180.");
            location.Longitude = dto.Longitude.Value;
        }

        if (dto.Name is not null) location.Name = dto.Name;
        if (dto.Address is not null) location.Address = dto.Address;
        if (dto.Sports is not null) location.Sports = dto.Sports;
        if (dto.Surface is not null) location.Surface = dto.Surface;
        if (dto.HasLights.HasValue) location.HasLights = dto.HasLights.Value;
        if (dto.MainPhotoUrl is not null) location.MainPhotoUrl = dto.MainPhotoUrl;
        if (dto.SecondaryPhotoUrls is not null) location.SecondaryPhotoUrls = dto.SecondaryPhotoUrls;
        if (dto.Details is not null) location.Details = dto.Details;

        location.UpdatedAt = DateTime.UtcNow;
        await _locationRepository.UpdateAsync(location);

        return MapToDto((await _locationRepository.GetByIdAsync(id))!);
    }

    public async Task DeleteAsync(int id, int currentUserId)
    {
        var location = await _locationRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Location with ID {id} not found.");

        if (location.ProposedByUserId != currentUserId)
            throw new UnauthorizedException("You can only modify locations you proposed.");

        await _locationRepository.DeleteAsync(id);
    }

    public async Task<LocationDto> ApproveAsync(int id)
    {
        var location = await _locationRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Location with ID {id} not found.");

        if (location.Status != LocationStatus.Pending)
            throw new ValidationException("Only pending locations can be approved.");

        location.Status = LocationStatus.Approved;
        location.UpdatedAt = DateTime.UtcNow;
        await _locationRepository.UpdateAsync(location);

        return MapToDto((await _locationRepository.GetByIdAsync(id))!);
    }

    public async Task<LocationDto> RejectAsync(int id)
    {
        var location = await _locationRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"Location with ID {id} not found.");

        if (location.Status != LocationStatus.Pending)
            throw new ValidationException("Only pending locations can be rejected.");

        location.Status = LocationStatus.Rejected;
        location.UpdatedAt = DateTime.UtcNow;
        await _locationRepository.UpdateAsync(location);

        return MapToDto((await _locationRepository.GetByIdAsync(id))!);
    }

    private static LocationDto MapToDto(Location location, double? distanceKm = null) => new()
    {
        Id = location.Id,
        Name = location.Name,
        Address = location.Address,
        Latitude = location.Latitude,
        Longitude = location.Longitude,
        Sports = location.Sports,
        Surface = location.Surface,
        HasLights = location.HasLights,
        MainPhotoUrl = location.MainPhotoUrl,
        SecondaryPhotoUrls = location.SecondaryPhotoUrls,
        Details = location.Details,
        Status = location.Status.ToString(),
        ProposedByUserId = location.ProposedByUserId,
        ProposedByUsername = location.ProposedBy?.Username,
        CreatedAt = location.CreatedAt,
        DistanceKm = distanceKm
    };

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
