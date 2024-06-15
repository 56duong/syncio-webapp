import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Label } from '../interfaces/label';
import { RegisterDTO } from 'src/app/features/authentication/register/register.dto';
import { HttpUtilService } from './http.util.service';
import { LoginDTO } from 'src/app/features/authentication/login/login.dto';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { FogotPasswordDTO } from 'src/app/features/authentication/forgotpassword/forgotpassword.dto';
@Injectable({
    providedIn: 'root',
})

export class LabelService {
    private apiURL = environment.apiUrl + 'api/v1/labels';
    
    private apiConfig = {
        headers: this.httpUtilService.createHeaders(),
    };
    constructor(
        private http: HttpClient,
        private httpUtilService: HttpUtilService
    ) { }

    // Sanh create Label using Label Controller
    createLabel(formData: FormData): Observable<any> {
        return this.http.post(this.apiURL, formData);

    }

    // removeLabel(user: User): Observable<any> {
    //     return this.http.delete(`${this.apiURL}/${user.id}`, this.apiConfig);
    // }

    updateLabel(id: string, formData: FormData): Observable<any> {
        return this.http.put(`${this.apiURL}/${id}`, formData);
    }


    getLabels(): Observable<Label[]> {
        return this.http.get<Label[]>(this.apiURL);
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
    getLabel(id: string): Observable<Label> {
        const url = `${this.apiURL}/${id}`;
        return this.http.get<Label>(url);
    }

    /**
     * Search users by username or email.
     * @param username - The username to search if exists.
     * @param email - The email to search if exists.
     * @returns array of users.
     */
    // searchLabels(username: string, email: string): Observable<User[]> {
    //     const url = `${this.apiURL}/search?username=${username}&email=${email}`;
    //     return this.http.get<User[]>(url);
    // }
}