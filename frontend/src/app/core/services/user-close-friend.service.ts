import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserCloseFriendService {

  private apiURL = environment.apiUrl + 'api/v1/userclosefriends';


  constructor(
    private http: HttpClient
  ) { }


  toggleCloseFriend(targetId: string): Observable<boolean> {
    const url = `${this.apiURL}/toggle-close-friend/${targetId}`;
    return this.http.post<boolean>(url, {});
  }

  /**
   * Remove close friend.
   * @param targetId 
   * @returns true if the close friend is removed successfully. Otherwise, false if the close friend is not removed, cause the targetId is not a close friend. 
   */
  removeCloseFriend(targetId: string): Observable<boolean> {
    const url = `${this.apiURL}/remove-close-friend/${targetId}`;
    return this.http.post<boolean>(url, {});
  }

}
