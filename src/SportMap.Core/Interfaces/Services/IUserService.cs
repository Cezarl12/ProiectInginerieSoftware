using SportMap.Models.DTOs.Users;

namespace SportMap.Core.Interfaces.Services;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> UpdateAsync(int id, UpdateUserDto dto);
    Task ChangePasswordAsync(int id, ChangePasswordDto dto);
    Task DeleteAsync(int id);
}
