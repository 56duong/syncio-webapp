import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserFollowService {

  private apiURL = environment.apiUrl + 'api/v1/userfollows';


  constructor(
    private http: HttpClient
  ) { }


  toggleFollow(targetId: string): Observable<boolean> {
    const url = `${this.apiURL}/toggle-follow/${targetId}`;
    return this.http.post<boolean>(url, {});
  }

  
  removeFollower(followerId: string): Observable<boolean> {
    const url = `${this.apiURL}/remove-follower/${followerId}`;
    return this.http.delete<boolean>(url);
  }


  /**
   * Get followers of the target user.
   * If the actor user is followed by the current user, they are given higher priority (sorted first).
   * @param targetId 
   * @param pageNumber 
   * @param pageSize 
   * @returns 
   */
  getFollowersSortedByMutualFollow(targetId: string, pageNumber: number, pageSize: number): Observable<any> {
    const url = `${this.apiURL}/${targetId}/followers`;
    const params = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
    return this.http.get<any>(url, { params });
  }


  /**
   * Get followings of the target user.
   * If the actor user is following the current user, they are given higher priority (sorted first).
   * @param targetId 
   * @param pageNumber 
   * @param pageSize 
   * @returns 
   */
  getFollowingsSortedByMutualFollow(targetId: string, pageNumber: number, pageSize: number): Observable<any> {
    const url = `${this.apiURL}/${targetId}/following`;
    const params = { pageNumber: pageNumber.toString(), pageSize: pageSize.toString() };
    return this.http.get<any>(url, { params });
  }

}
