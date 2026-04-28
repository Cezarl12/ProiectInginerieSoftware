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

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await _userRepository.ExistsByEmailAsync(dto.Email))
            throw new ConflictException($"Email '{dto.Email}' is already registered.");

        if (await _userRepository.ExistsByUsernameAsync(dto.Username))
            throw new ConflictException($"Username '{dto.Username}' is already taken.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = _passwordHasher.Hash(dto.Password),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _userRepository.AddAsync(user);
        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(created);

        return new AuthResponseDto
        {
            UserId = created.Id,
            Username = created.Username,
            Email = created.Email,
            Token = token,
            ExpiresAt = expiresAt
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email.ToLowerInvariant())
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (!_passwordHasher.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(user);

        return new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            Token = token,
            ExpiresAt = expiresAt
        };
    }
}
