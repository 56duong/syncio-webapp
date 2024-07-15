export interface Comment {
  id?: string;
  postId?: string;
  userId?: string;
  username?: string;
  createdDate?: string;
  text?: string;
  parentCommentId?: string;
  replies?: Comment[];
  repliesCount?: number;
  likesCount?: number;

  isShowReplies?: boolean;
}
