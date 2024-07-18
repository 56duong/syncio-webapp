import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Label } from '../interfaces/label';
import { UserLabelInfo } from '../interfaces/user-label-info';
import { HttpUtilService } from './http.util.service';
import { LabelResponse } from '../interfaces/label-response';
@Injectable({
    providedIn: 'root',
})

export class UserLabelInfoService {
    private apiURL = environment.apiUrl + 'api/v1/user-label-infos';
    
    private apiConfig = {
        headers: this.httpUtilService.createHeaders(),
    };
    constructor(
        private http: HttpClient,
        private httpUtilService: HttpUtilService
    ) { }

    // updateLabel(id: string, formData: FormData): Observable<any> {
    //     return this.http.put(`${this.apiURL}/${id}`, formData);
    // }

    getLabelsByUserId(user_id: string): Observable<UserLabelInfo[]> {
        const url = `${this.apiURL}/${user_id}`;
        return this.http.get<UserLabelInfo[]>(url);
    }

    getLabelURL(userId: string): Observable<string> {
        const params = new HttpParams().set('userId', userId);
        return this.http.get(`${this.apiURL}/labelURL`, { params, responseType: 'text' }) as Observable<string>;
    }

    update_isShow(user_id: string, cur_label_id: string, new_label_id: string): Observable<any> {
        const params = new HttpParams()
            .set('userId', user_id)
            .set('curLabelId', cur_label_id)
            .set('newLabelId', new_label_id);

        return this.http.put(`${this.apiURL}/update-isShow`, this.apiConfig, { params, responseType: 'text' as 'json' });
    }

    getShowTrue(user_id: string): Observable<any> {
        const params = new HttpParams().set('userId', user_id);
        return this.http.get<LabelResponse[]>(`${this.apiURL}/show`, { params });
    }
}