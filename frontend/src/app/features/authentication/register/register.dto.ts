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

  // facebook_account_id: number = 0;
  // google_account_id: number = 0;
  @IsString()
  role_name: string = 'USER';
  constructor(data: any) {
    this.username = data.username;
    this.email = data.email;

    this.password = data.password;
    this.retype_password = data.retype_password;

    // this.facebook_account_id = data.facebook_account_id || 0;
    // this.google_account_id = data.google_account_id || 0;
    this.role_name = data.role_name || 'USER';
  }
}
