import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Report } from '../interfaces/report';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiURL = environment.apiUrl + 'api/v1/reports';
  constructor(private http: HttpClient) {}

  createReport(report: Report): Observable<any> {
    return this.http.post<any>(this.apiURL, report);
  }
}
