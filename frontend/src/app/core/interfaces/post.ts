import { Photo } from "./photo";

export interface Post {
  id?: string;
  caption?: string;
  audioURL?: string;
  photos?: Photo[];
  createdDate?: string;
  flag?: boolean;
  username?: string;
  createdBy?: string;
  likeCount?: number;
  commentCount?: number;
  visibility?: Visibility;
}

export enum Visibility {
  PRIVATE = 'PRIVATE',
  CLOSE_FRIENDS = 'CLOSE_FRIENDS',
  PUBLIC = 'PUBLIC',
}
