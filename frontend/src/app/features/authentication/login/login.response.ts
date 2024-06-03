export interface LoginResponse {
  data: LoginResponseData;
  // other properties
}

export interface LoginResponseData {
  token: string;
  refresh_token: string;
  // other properties
}
