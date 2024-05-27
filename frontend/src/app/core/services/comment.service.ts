import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Comment } from '../interfaces/comment';
import { CompatClient, IMessage, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})

export class CommentService {
  
  private apiURL = environment.apiUrl + 'api/v1/comments';

  private webSocketURL = environment.apiUrl + 'live'; // WebSocket URL with 'live' is the endpoint for the WebSocket configuration in the backend. In WebSocketConfig.java, the endpoint is '/live'.
  private stompClient: CompatClient = {} as CompatClient;
  private commentSubject: BehaviorSubject<Comment> = new BehaviorSubject<Comment>({}); // BehaviorSubject of Comment type. You can know when a new comment is received.

  constructor(private http: HttpClient) { }



  /* ---------------------------- REALTIME SECTION ---------------------------- */


  /**
   * Connect to the WebSocket. Subscribe to the topic '/topic/comment/{postId}', 
   * that URL is the endpoint for the WebSocket configuration in the backend with @SendTo annotation.
   * @param postId - The id of the post.
   */
  connectWebSocket(postId: string) {
    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(`/topic/comment/${postId}`, (comment: IMessage) => {
        this.commentSubject.next(JSON.parse(comment.body));
      });
    });
  }

  /**
   * Get the comments observable.
   * @returns the comment observable.
   * @example
   * this.commentService.getCommentsObservable().subscribe({
   *  next: (comment) => {
   *   console.log(comment);
   *   this.comments.unshift({ ...comment, createdDate: 'now' });
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   */
  getCommentsObservable(): Observable<Comment> {
    return this.commentSubject.asObservable();
  }

  /**
   * Disconnect from the WebSocket.
   * @param postId - The id of the post.
   */
  disconnect(postId: string) {
    this.stompClient.unsubscribe(`/topic/comment/${this.stompClient}`);
    this.stompClient.deactivate();
    this.stompClient.disconnect();
  }

  /**
   * Send a comment to the WebSocket. /app is config in setApplicationDestinationPrefixes method in WebSocketConfig.java 
   * and '/app/comment/{postId}' is the endpoint for the WebSocket configuration in the backend with @MessageMapping annotation.
   * @param comment - The comment object.
   */
  sendComment(comment: Comment) {
    if(comment.parentCommentId) return;
    this.stompClient.publish({ 
        destination: `/app/comment/${comment.postId}`, 
        body: JSON.stringify(comment) 
      });
  }



  /* ---------------------------- CRUD SECTION ---------------------------- */

  
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
