import { IsString, IsNotEmpty, IsEmail, IsDate } from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  role_name: string;

  constructor(data: any) {
    this.email = data.email;
    this.password = data.password;
    this.role_name = data.role_name;
  }
}
