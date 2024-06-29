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

  getReportsByPostId(postId: string): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiURL}/${postId}`);
  }

  deleteReportsByPostId(postId: string): Observable<void> {
    const url = `${this.apiURL}/${postId}`;
    return this.http.delete<void>(url);
  }
  
}
