import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpUtilService } from './http.util.service';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiCreatePayment = environment.apiUrl + 'api/v1/payment/create-payment';

  private apiConfig = {
    headers: this.httpUtilService.createHeaders(),
  };

  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService,
  ) {}

  createVNPayPayment(params: any): Observable<any> {
    return this.http.post<any>(this.apiCreatePayment, params);
  }
}