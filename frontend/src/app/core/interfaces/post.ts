export interface Post {
  id?: string;
  caption?: string;
  photos?: string[];
  createdDate?: string;
  flag?: boolean;
  createdBy?: string;
  likeCount?: number;
  commentCount?: number;
  visibility?: string;
}
