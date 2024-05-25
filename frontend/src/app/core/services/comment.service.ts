import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Comment } from '../interfaces/comment';

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

  /**
   * Get comments for a post.
   * @param postId - The id of the post.
   * @returns the comments for the post.
   * @example
   * this.commentService.getComments(postId).subscribe({
   *  next: (comments) => {
   *   this.comments = comments;
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * })
   */
  getComments(postId: string): Observable<Comment[]> {
    const url = `${this.apiURL}/${postId}`;
    return this.http.get<Comment[]>(url);
  }

  /**
   * Get comments for a post where the parent comment is null.
   * @param postId - The id of the post.
   * @returns the comments for the post where the parent comment is null.
   */
  getParentComments(postId: string): Observable<Comment[]> {
    const url = `${this.apiURL}/${postId}/parentCommentIsNull`;
    return this.http.get<Comment[]>(url);
  }

  /**
   * Get replies for a comment.
   * @param postId - The id of the post.
   * @param parentCommentId - The id of the parent comment.
   * @returns the replies for the comment.
   * @example
   * this.commentService.getReplies(postId, parentCommentId).subscribe({
   *  next: (replies) => {
   *   console.log(replies);
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * })
   */
  getReplies(postId: string, parentCommentId: string): Observable<Comment[]> {
    const url = `${this.apiURL}/${postId}/${parentCommentId}`;
    return this.http.get<Comment[]>(url);
  }

  /**
   * Post a comment for a post.
   * @param comment - The comment object (must contain postId).
   * @returns the comment id.
   * @example
   * this.commentService.postComment(postId, text).subscribe({
   *  next: (id) => {
   *   console.log(id);
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * })
   */
  postComment(comment: Comment): Observable<string> {
    return this.http.post<string>(this.apiURL, comment);
  }

}
