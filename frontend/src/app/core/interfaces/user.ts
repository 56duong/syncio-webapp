import { Post } from './post';

export interface User {
  id?: string;

  email?: string;

  username?: string;

  password?: string;

  coverURL?: string;

  bio?: string;

  createdDate?: string;

  role?: RoleEnum;

  status?: StatusEnum;

  avtURL?: string;
}

export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DISABLED = 'DISABLED',
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
