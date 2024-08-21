import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';
import { RegisterDTO } from 'src/app/features/authentication/register/register.dto';
import { HttpUtilService } from './http.util.service';
import { LoginDTO } from 'src/app/features/authentication/login/login.dto';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { FogotPasswordDTO } from 'src/app/features/authentication/forgotpassword/forgotpassword.dto';
import { UserProfile } from '../interfaces/user-profile';
import { UserSearch } from '../interfaces/user-search';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiURL = environment.apiUrl + 'api/v1/users';
  private apiRegister = environment.apiUrl + 'api/v1/users/register';
  private apiResetPassword = environment.apiUrl + 'api/v1/users/reset_password';
  private apiConfirmUserRegister =
    environment.apiUrl + 'api/v1/users/confirm-user-register';
  private apiSendMailToPassword =
    environment.apiUrl + 'api/v1/users/forgot_password';
  private apiLogin = environment.apiUrl + 'api/v1/users/login';
  private apiUserDetail = environment.apiUrl + 'api/v1/users/details';
  private apiPython = environment.apiPythonUrl;
  private apiResendEmail = environment.apiUrl + 'api/v1/users/resend-email';
  private apiConfig = {
    headers: this.httpUtilService.createHeaders(),
  };
  private readonly TOKEN_KEY = 'access_token';

  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService
  ) {}

  resetPassword(token: any, password: any): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('password', password);

    return this.http.post(this.apiResetPassword, null, { params });
  }
  register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }
  resendRegistrationEmail(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.post(this.apiResendEmail, {}, { params });
  }
  // Create user using User Controller
  createUserInAdmin(user: User): Observable<any> {
    return this.http.post(this.apiURL, user, this.apiConfig);
  }

  // Update user using User Controller
  updateUserInAdmin(user: User): Observable<any> {
    return this.http.put(`${this.apiURL}/${user.id}`, user, this.apiConfig);
  }

  confirmUserRegister(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.post(this.apiConfirmUserRegister, {}, { params });
  }
  sendPasswordToMailSerive(
    fogotPasswordDTO: FogotPasswordDTO
  ): Observable<any> {
    return this.http.post(
      this.apiSendMailToPassword,
      fogotPasswordDTO,
      this.apiConfig
    );
  }
  login(loginDTO: LoginDTO): Observable<any> {
    return this.http.post(this.apiLogin, loginDTO, this.apiConfig);
  }
  getUserDetail(token: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(this.apiUserDetail, {}, { headers: headers });
  }
  saveUserResponseToLocalStorage(userResponse?: UserResponse | null) {
    try {
      if (userResponse == null || !userResponse) {
        return;
      }

      // Convert the userResponse object to a JSON string
      const userResponseJSON = JSON.stringify(userResponse);
      // Save the JSON string to local storage with a key (e.g., "userResponse")
      localStorage.setItem('user', userResponseJSON);
    } catch (error) {
      console.error('Error saving user response to local storage:', error);
    }
  }
  getUserResponseFromLocalStorage(): UserResponse | null {
    try {
      // Retrieve the JSON string from local storage using the key
      const userResponseJSON = localStorage.getItem('user');
      if (userResponseJSON == null || userResponseJSON == undefined) {
        return null;
      }
      // Parse the JSON string back to an object
      const userResponse = JSON.parse(userResponseJSON!);

      return userResponse;
    } catch (error) {
      console.error(
        'Error retrieving user response from local storage:',
        error
      );
      return null; // Return null or handle the error as needed
    }
  }
  removeUserFromLocalStorage(): void {
    try {
      // Remove the user data from local storage using the key
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }
  /**
   * Get all users.
   * @returns array of users.
   * @example
   * this.userService.getUsers().subscribe({
   *    next: (users) => {
   *      this.users = users;
   *    },
   *    error: (error) => {

   *    }
   *  })
   */
  getUsers(username?: string): Observable<User[]> {
    const url = username ? `${this.apiURL}?username=${username}` : this.apiURL;
    return this.http.get<User[]>(url);
  }

  getUsersRecommend(username?: string): Observable<User[]> {
    const url = username
      ? `${this.apiPython}recommend?username=${username}`
      : this.apiURL;
    return this.http.get<User[]>(url);
  }

  searchUsersByUsername(username?: string): Observable<UserProfile[]> {
    const url = username
      ? `${this.apiURL}/search-by-username?username=${username}`
      : this.apiURL;
    return this.http.get<UserProfile[]>(url);
  }

  isFollowing(userId: string, targetId: string): Observable<any> {
    const url = `${this.apiURL}/${userId}/is-following/${targetId}`;
    return this.http.get(url);
  }

  /**
   * Get a user by id.
   * @param userId - The id of the user.
   * @returns a user.
   * @example
   * this.userService.getUser(userId).subscribe({
   *   next: (user) => {
   *    this.user = user;
   *  },
   *  error: (error) => {

   *  }
   * })
   */
  getUser(userId: string): Observable<User> {
    const url = `${this.apiURL}/${userId}`;
    return this.http.get<User>(url);
  }

  /**
   * Get User Profile By Id.
   * @param userId
   * @returns
   */
  getUserProfile(userId: any): Observable<UserProfile> {
    const url = `${this.apiURL}/profile/${userId}`;
    return this.http.get<UserProfile>(url, {});
  }

  updateUser(user: User, userId: any): Observable<UserResponse> {
    const url = `${this.apiURL}/update-profile/${userId}`;
    return this.http.put<UserResponse>(url, user);
  }

  /**
   * Get username by id.
   * @param userId
   * @returns response object containing the username.
   * @example
   * this.userService.getUsernameById(userId).subscribe({
   *  next: (response: any) => {
   *   this.username = response.username;
   *  },
   *  error: (error) => {
   *   console.error(error);
   *  }
   * })
   */
  getUsernameById(userId: string): Observable<Object> {
    const url = `${this.apiURL}/${userId}/username`;
    return this.http.get<Object>(url);
  }

  /**
   * Get user id by username.
   * @param userId
   * @returns response object containing the userId.
   * @example
   * this.userService.getUserIdByUsername(userId).subscribe({
   *  next: (response) => {
   *   this.userId = response.userId;
   *  },
   *  error: (error) => {
   *   console.error(error);
   *  }
   * })
   */
  getUserIdByUsername(username: string): Observable<any> {
    const url = `${this.apiURL}/username/${username}`;
    return this.http.get<any>(url);
  }

  getQrCodeFromUser(userId: string): Observable<any> {
    const url = `${this.apiURL}/getQrcode/${userId}`;
    return this.http.get(url, { responseType: 'text' });
  }

  /**
   * Search users by username or email.
   * @param username - The username to search if exists.
   * @param email - The email to search if exists.
   * @returns top 20 users that match the search criteria.
   */
  searchUsers(username: string, email: string): Observable<UserSearch[]> {
    const url = `${this.apiURL}/search?username=${username}&email=${email}`;
    return this.http.get<UserSearch[]>(url);
  }

  changeAvatar(formData: FormData): Observable<void> {
    const url = `${this.apiURL}/update-avatar`;
    return this.http.post<void>(url, formData);
  }

  // getNewUsersLast30Days(): Observable<any> {
  //   const url = `${this.apiURL}/last30days`;
  //   return this.http.get<any>(url);
  // }

  // getNewUsersLast7Days(): Observable<any> {
  //   const url = `${this.apiURL}/last7days`;
  //   return this.http.get<any>(url);
  // }

  // getNewUsersLast100Days(): Observable<any> {
  //   const url = `${this.apiURL}/last100days`;
  //   return this.http.get<any>(url);
  // }

  getNewUsersLastNDays(days: number): Observable<any> {
    return this.http.get(`${this.apiURL}/last/${days}`);
  }

  getUserCount(): Observable<number> {
    return this.getUsers().pipe(map((users) => users.length));
  }

  logout(): Observable<any> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(
      `${this.apiURL}/logout`,
      {},
      { headers: headers }
    );
  }
}
