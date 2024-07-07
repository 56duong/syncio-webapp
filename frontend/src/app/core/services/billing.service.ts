import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Billing } from '../interfaces/billing';
import { HttpUtilService } from './http.util.service';
@Injectable({
    providedIn: 'root',
})

export class BillingService {
    private apiURL = environment.apiUrl + 'api/v1/billing';
    
    private apiConfig = {
        headers: this.httpUtilService.createHeaders(),
    };
    constructor(
        private http: HttpClient,
        private httpUtilService: HttpUtilService
    ) { }

    getAllBillOfCurrentUser(userId: string): Observable<Billing[]> {
        const url = `${this.apiURL}/${userId}`;
        return this.http.get<Billing[]>(url);
    }
}