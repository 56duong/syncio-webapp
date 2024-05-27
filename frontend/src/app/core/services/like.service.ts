import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  private apiURL = environment.apiUrl + 'api/v1/likes';

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
  countLikes(postId: string): Observable<number> {
    const url = `${this.apiURL}/count/${postId}`;
    return this.http.get<number>(url);
  }
}
