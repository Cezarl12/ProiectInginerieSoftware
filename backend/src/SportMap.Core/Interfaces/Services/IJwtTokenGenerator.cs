using SportMap.Core.Entities;

namespace SportMap.Core.Interfaces.Services;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
    (string Token, DateTime Expiry) GenerateRefreshToken();
}
