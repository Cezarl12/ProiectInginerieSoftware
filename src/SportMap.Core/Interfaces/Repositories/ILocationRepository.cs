using SportMap.Core.Entities;

namespace SportMap.Core.Interfaces.Repositories;

public interface ILocationRepository
{
    Task<Location?> GetByIdAsync(int id);
}
