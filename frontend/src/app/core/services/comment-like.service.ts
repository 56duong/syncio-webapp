import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CommentLikeService {
  
  private apiURL = environment.apiUrl + 'api/v1/commentlikes';

  constructor(private http: HttpClient) { }

  /**
   * Like a comment.
   * @param commentId - The id of the comment to like.
   * @example
   * this.commentLikeService.toggleLikeComment(comment.id).subscribe({
   *  next: () => {
   *    // Do something.
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   */
  toggleLikeComment(commentId: string): Observable<any> {
    const url = `${this.apiURL}/${commentId}`;
    return this.http.post(url, {});
  }

  /**
   * Check if the current user has liked a comment.
   * @param commentId 
   * @returns true if the current user has liked the comment, false otherwise.
   */
  hasCommentLiked(commentId: string): Observable<boolean> {
    const url = `${this.apiURL}/hasCommentLiked/${commentId}`;
    return this.http.get<boolean>(url);
  }

}
