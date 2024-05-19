import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CommentService {
  
  private apiURL = environment.apiUrl + 'api/v1/comments';

  constructor(private http: HttpClient) { }

  /**
   * Count the number of comments for a post.
   * @param postId - The id of the post.
   * @returns the number of comments.
   * @example
   * this.commentService.countComments(postId).subscribe({
   *  next: (count) => {
   *   this.commentCount = count;
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * })
   */
  countComments(postId: string): Observable<number> {
    const url = `${this.apiURL}/count/${postId}`;
    return this.http.get<number>(url);
  }
}
