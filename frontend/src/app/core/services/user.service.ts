import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiURL = environment.apiUrl + 'api/v1/users';

  constructor(private http: HttpClient) {}

  /**
   * Get all users.
   * @returns array of users.
   * @example
   * this.userService.getUsers().subscribe({
   *    next: (users) => {
   *      this.users = users;
   *    },
   *    error: (error) => {
   *      console.log(error);
   *    }
   *  })
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiURL);
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
   *    console.log(error);
   *  }
   * })
   */
  getUser(userId: string): Observable<User> {
    const url = `${this.apiURL}/${userId}`;
    return this.http.get<User>(url);
  }
}
