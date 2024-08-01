import { IsString, IsNotEmpty, IsEmail, IsDate } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  emailOrUsername: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  role_name: string;

  constructor(data: any) {
    this.emailOrUsername = data.emailOrUsername;
    this.password = data.password;
    this.role_name = data.role_name;
  }
}
