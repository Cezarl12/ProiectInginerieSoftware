using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.DTOs.Users;

namespace SportMap.Core.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user is null ? null : MapToDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"User with ID {id} not found.");

        if (!string.IsNullOrWhiteSpace(dto.Username) && dto.Username != user.Username)
        {
            if (await _userRepository.ExistsByUsernameAsync(dto.Username))
                throw new ConflictException($"Username '{dto.Username}' is already taken.");
            user.Username = dto.Username;
        }

        if (dto.ProfilePhotoUrl is not null)
            user.ProfilePhotoUrl = dto.ProfilePhotoUrl;

        if (dto.FavoriteSports is not null)
            user.FavoriteSports = dto.FavoriteSports;

        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return MapToDto(user);
    }

    public async Task ChangePasswordAsync(int id, ChangePasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"User with ID {id} not found.");

        if (!_passwordHasher.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedException("Current password is incorrect.");

        user.PasswordHash = _passwordHasher.Hash(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new NotFoundException($"User with ID {id} not found.");

        await _userRepository.DeleteAsync(id);
    }

    private static UserDto MapToDto(Core.Entities.User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        ProfilePhotoUrl = user.ProfilePhotoUrl,
        FavoriteSports = user.FavoriteSports,
        CreatedAt = user.CreatedAt
    };
}
