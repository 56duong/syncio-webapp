import { IsString, IsNotEmpty, IsEmail, IsDate } from 'class-validator';

export class FogotPasswordDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  constructor(data: any) {
    this.email = data.email;
  }
}
