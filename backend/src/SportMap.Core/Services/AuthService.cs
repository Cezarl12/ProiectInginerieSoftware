using SportMap.Core.Entities;
using SportMap.Core.Exceptions;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Core.Interfaces.Services;
using SportMap.Models.DTOs.Auth;

namespace SportMap.Core.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IEmailService _emailService;
    private readonly string _appBaseUrl;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IEmailService emailService,
        string appBaseUrl)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _emailService = emailService;
        _appBaseUrl = appBaseUrl;
    }

    public async Task<RegisterResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _userRepository.ExistsByEmailAsync(dto.Email))
            throw new ConflictException($"Email '{dto.Email}' is already registered.");

        if (await _userRepository.ExistsByUsernameAsync(dto.Username))
            throw new ConflictException($"Username '{dto.Username}' is already taken.");

        var token = Guid.NewGuid().ToString("N");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = _passwordHasher.Hash(dto.Password),
            IsEmailConfirmed = false,
            EmailConfirmationToken = token,
            EmailConfirmationTokenExpiry = DateTime.UtcNow.AddHours(24),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _userRepository.AddAsync(user);

        var confirmationLink = $"{_appBaseUrl}/api/auth/confirm-email?token={token}";
        await _emailService.SendEmailConfirmationAsync(created.Email, created.Username, confirmationLink);

        return new RegisterResponseDto
        {
            UserId = created.Id,
            Email = created.Email,
            Message = "Registration successful. Please check your email to confirm your account."
        };
    }

    public async Task ConfirmEmailAsync(string token)
    {
        var user = await _userRepository.GetByConfirmationTokenAsync(token)
            ?? throw new NotFoundException("Invalid or expired confirmation token.");

        if (user.EmailConfirmationTokenExpiry < DateTime.UtcNow)
            throw new ValidationException("Confirmation link has expired. Please request a new one.");

        user.IsEmailConfirmed = true;
        user.EmailConfirmationToken = null;
        user.EmailConfirmationTokenExpiry = null;
        await _userRepository.UpdateAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email.ToLowerInvariant())
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (!_passwordHasher.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        if (!user.IsEmailConfirmed)
            throw new UnauthorizedException("Email not confirmed. Please check your inbox and confirm your account.");

        return await BuildAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshRequestDto dto)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(dto.RefreshToken)
            ?? throw new UnauthorizedException("Invalid refresh token.");

        if (user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token has expired.");

        return await BuildAuthResponseAsync(user);
    }

    public async Task LogoutAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new NotFoundException($"User with ID {userId} not found.");

        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;
        await _userRepository.UpdateAsync(user);
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(User user)
    {
        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(user);
        var (refreshToken, refreshExpiry) = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = refreshExpiry;
        await _userRepository.UpdateAsync(user);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            ExpiresAt = expiresAt,
            RefreshToken = refreshToken,
            RefreshTokenExpiry = refreshExpiry,
            Role = user.Role.ToString()
        };
    }
}
