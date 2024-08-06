export interface PostCollection {
  id?: string;
  name?: string;
  description?: string;
  createdDate?: string;
  status?: PostCollectionEnum;
  createdById?: string;
  imageUrl?: string;
}

export enum PostCollectionEnum {
  PRIVATE = 'PRIVATE',
  DELETE = 'DELETE',
  PUBLIC = 'PUBLIC',
}