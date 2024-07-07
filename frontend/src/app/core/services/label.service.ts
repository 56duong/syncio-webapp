import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Label } from '../interfaces/label';
import { HttpUtilService } from './http.util.service';
import { LabelResponse } from '../interfaces/label-response';
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

    getLabelsWithPurchaseStatus(user_id: string): Observable<LabelResponse[]> {
        const params = new HttpParams().set('user_id', user_id);
        return this.http.get<LabelResponse[]>(`${this.apiURL}/buy`, { params });
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