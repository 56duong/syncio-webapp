import { IsString, IsNotEmpty, IsEmail, IsDate } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  emailOrUsername: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  constructor(data: any) {
    this.emailOrUsername = data.emailOrUsername;
    this.password = data.password;
  }
}
