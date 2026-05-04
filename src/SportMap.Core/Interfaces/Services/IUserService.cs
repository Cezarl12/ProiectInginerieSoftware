using SportMap.Models.Common;
using SportMap.Models.DTOs.Users;

namespace SportMap.Core.Interfaces.Services;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<PagedResult<UserDto>> GetAllAsync(PaginationQuery pagination);
    Task<UserDto> UpdateAsync(int id, UpdateUserDto dto);
    Task ChangePasswordAsync(int id, ChangePasswordDto dto);
    Task DeleteAsync(int id);
    Task PromoteToAdminAsync(int targetUserId);
}
