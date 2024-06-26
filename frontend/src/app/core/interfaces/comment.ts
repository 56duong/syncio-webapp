export interface Comment {
  id?: string;
  postId?: string;
  userId?: string;
  createdDate?: string;
  text?: string;
  parentCommentId?: string;
  replies?: Comment[];
  repliesCount?: number;
  likesCount?: number;
}
