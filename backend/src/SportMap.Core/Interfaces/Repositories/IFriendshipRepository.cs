using SportMap.Core.Entities;

namespace SportMap.Core.Interfaces.Repositories;

public interface IFriendshipRepository
{
    Task<Friendship?> GetAsync(int followerId, int followeeId);
    Task<bool> ExistsAsync(int followerId, int followeeId);
    /// <summary>True iff both <paramref name="userA"/> and <paramref name="userB"/> follow each other.</summary>
    Task<bool> AreMutualAsync(int userA, int userB);
    /// <summary>Returns the IDs of users who follow <paramref name="userId"/> back (mutual relationships).</summary>
    Task<IEnumerable<int>> GetMutualFriendIdsAsync(int userId);
    Task<(IEnumerable<User> Items, int TotalCount)> GetFolloweesAsync(int followerId, int page, int pageSize);
    Task<(IEnumerable<User> Items, int TotalCount)> GetFollowersAsync(int followeeId, int page, int pageSize);
    Task<IEnumerable<int>> GetFolloweeIdsAsync(int followerId);
    Task<Friendship> AddAsync(Friendship friendship);
    Task DeleteAsync(int followerId, int followeeId);
}
