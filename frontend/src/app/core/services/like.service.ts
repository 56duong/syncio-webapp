import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private apiURL = environment.apiUrl + 'api/v1/likes';
  private apiURLPost = environment.apiUrl + 'api/v1/posts';

  constructor(private http: HttpClient, private tokenService: TokenService) {}


  toggleLikes(postId: any, userId: any): Observable<void> {
    const url = `${this.apiURLPost}/${postId}/${userId}/like`;
    return this.http.post<void>(url, {});
  }
    /**
   * Count the number of likes for a post.
   * @param postId - The id of the post.
   * @returns the number of likes.
   * @example
   * this.likeService.countLikes(postId).subscribe({
   *  next: (count) => {
   *   this.likeCount = count;
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * })
   */
  countLikes(postId: string): Observable<number> {
    const url = `${this.apiURL}/count/${postId}`;
    return this.http.get<number>(url);
  }

  hasLiked(postId: string): Observable<boolean> {
    const token = this.tokenService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const url = `${this.apiURL}/${postId}/likes`;
    return this.http.get<boolean>(url, { headers: headers });
  }
}
