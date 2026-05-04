using Microsoft.EntityFrameworkCore;
using SportMap.Core.Entities;
using SportMap.Core.Interfaces.Repositories;
using SportMap.Infrastructure.Data;

namespace SportMap.Infrastructure.Repositories;

public class FriendshipRepository : IFriendshipRepository
{
    private readonly SportMapDbContext _context;

    public FriendshipRepository(SportMapDbContext context)
    {
        _context = context;
    }

    public async Task<Friendship?> GetAsync(int followerId, int followeeId) =>
        await _context.Friendships
            .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);

    public async Task<bool> ExistsAsync(int followerId, int followeeId) =>
        await _context.Friendships
            .AnyAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);

    public async Task<(IEnumerable<User> Items, int TotalCount)> GetFolloweesAsync(int followerId, int page, int pageSize)
    {
        var query = _context.Friendships
            .AsNoTracking()
            .Where(f => f.FollowerId == followerId);
        var total = await query.CountAsync();
        var items = await query
            .Include(f => f.Followee)
            .OrderBy(f => f.Followee!.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => f.Followee!)
            .ToListAsync();
        return (items, total);
    }

    public async Task<(IEnumerable<User> Items, int TotalCount)> GetFollowersAsync(int followeeId, int page, int pageSize)
    {
        var query = _context.Friendships
            .AsNoTracking()
            .Where(f => f.FolloweeId == followeeId);
        var total = await query.CountAsync();
        var items = await query
            .Include(f => f.Follower)
            .OrderBy(f => f.Follower!.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(f => f.Follower!)
            .ToListAsync();
        return (items, total);
    }

    public async Task<IEnumerable<int>> GetFolloweeIdsAsync(int followerId) =>
        await _context.Friendships
            .AsNoTracking()
            .Where(f => f.FollowerId == followerId)
            .Select(f => f.FolloweeId)
            .ToListAsync();

    public async Task<Friendship> AddAsync(Friendship friendship)
    {
        _context.Friendships.Add(friendship);
        await _context.SaveChangesAsync();
        return friendship;
    }

    public async Task DeleteAsync(int followerId, int followeeId)
    {
        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FolloweeId == followeeId);
        if (friendship is not null)
        {
            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();
        }
    }
}
