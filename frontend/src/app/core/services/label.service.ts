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

    createLabel(formData: FormData): Observable<any> {
        return this.http.post(this.apiURL, formData);

    }

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

    getLabelsUserPurchased(user_id: string): Observable<LabelResponse[]> {
        const params = new HttpParams().set('user_id', user_id);
        return this.http.get<LabelResponse[]>(`${this.apiURL}/buyed`, { params });
    }

    getLabel(id: string): Observable<Label> {
        const url = `${this.apiURL}/${id}`;
        return this.http.get<Label>(url);
    }


}