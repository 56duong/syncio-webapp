import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EngagementMetricsDTO } from '../interfaces/engagement-metrics';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  private apiURL = environment.apiUrl + 'api/v1/dashboard';

  constructor(
    private http: HttpClient
  ) { }


  getEngagementMetrics(days: number): Observable<EngagementMetricsDTO[]> {
    const url = `${this.apiURL}/engagement-metrics?days=${days}`;
    return this.http.get<EngagementMetricsDTO[]>(url);
  }

  
  /**
   * Get the top users with the most outstanding engagements.
   * @param days 
   * @param limit 
   * @returns the map of users with the score of engagements. Example: outstandingUsers: {user: User; score: number;}[]
   */
  getOutstandingUsers(days: number, limit: number): Observable<any> {
    const url = `${this.apiURL}/outstanding/${days}/${limit}`;
    return this.http.get<any>(url);
  }

}
