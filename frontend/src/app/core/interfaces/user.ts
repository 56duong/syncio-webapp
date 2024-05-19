export interface User {

  id?: string;

  email?: string;

  username?: string;

  password?: string;

  avtURL?: string;

  coverURL?: string;

  bio?: string;

  createdDate?: string;

  role: RoleEnum;

  status?: StatusEnum;
}

export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  DISABLED = 'DISABLED'
}

export enum RoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER'
}
