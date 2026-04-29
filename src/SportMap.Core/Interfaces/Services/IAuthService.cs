using SportMap.Models.DTOs.Auth;

namespace SportMap.Core.Interfaces.Services;

public interface IAuthService
{
    Task<RegisterResponseDto> RegisterAsync(RegisterDto dto);
    Task ConfirmEmailAsync(string token);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshAsync(RefreshRequestDto dto);
    Task LogoutAsync(int userId);
}
