import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private apiURL = environment.apiUrl + 'api/v1/likes';
  private apiURLPost = environment.apiUrl + 'api/v1/posts';
  constructor(private http: HttpClient) {}

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
  toggleLikes(postId: any, userId: any): Observable<void> {
    const url = `${this.apiURLPost}/${postId}/${userId}/like`;
    return this.http.post<void>(url, {});
  }
  countLikes(postId: string): Observable<number> {
    const url = `${this.apiURL}/count/${postId}`;
    return this.http.get<number>(url);
  }
}
