import { Post } from './post';

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  isCloseFriend: boolean;
  avtURL?: string;
  posts: Post[];
}
