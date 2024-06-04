import { IsString, IsNotEmpty, IsEmail, IsDate } from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  retype_password: string;
  constructor(data: any) {
    this.username = data.username;
    this.email = data.email;

    this.password = data.password;
    this.retype_password = data.retype_password;
  }
}
