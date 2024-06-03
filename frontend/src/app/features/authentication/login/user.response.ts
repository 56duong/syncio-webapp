export interface UserResponse {
  id: string;
  username: string;
  fullname: string;
  address: string;
  is_active: boolean;
  date_of_birth: Date;
  facebook_account_id: number;
  google_account_id: number;
  role: string;
}
