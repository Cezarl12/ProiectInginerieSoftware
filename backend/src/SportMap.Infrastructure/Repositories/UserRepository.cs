using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Infrastructure.Data;

namespace SportMap.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly SportMapDbContext _context;

    public UserRepository(SportMapDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id) =>
        await _context.Users.FindAsync(id);

    public async Task<User?> GetByEmailAsync(string email) =>
        await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User?> GetByUsernameAsync(string username) =>
        await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

    public async Task<(IEnumerable<User> Items, int TotalCount)> GetAllAsync(int page, int pageSize)
    {
        var query = _context.Users.AsNoTracking();
        var total = await query.CountAsync();
        var items = await query.OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return (items, total);
    }

    public async Task<User> AddAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is not null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsByEmailAsync(string email) =>
        await _context.Users.AnyAsync(u => u.Email == email);

    public async Task<bool> ExistsByUsernameAsync(string username) =>
        await _context.Users.AnyAsync(u => u.Username == username);

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken) =>
        await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

    public async Task<User?> GetByConfirmationTokenAsync(string token) =>
        await _context.Users.FirstOrDefaultAsync(u => u.EmailConfirmationToken == token);
}
