import type { User } from './user.model';

export interface Friendship {
  id: number;
  followerId: number;
  followeeId: number;
  createdAt: string;
  follower?: User | null;
  followee?: User | null;
}
