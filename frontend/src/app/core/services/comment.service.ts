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

  private webSocketURL = environment.apiUrl + 'api/live'; // WebSocket URL with 'api/live' is the endpoint for the WebSocket configuration in the backend. In WebSocketConfig.java, the endpoint is '/api/live'.
  private stompClient: CompatClient = {} as CompatClient;
  private commentSubject: BehaviorSubject<Comment> = new BehaviorSubject<Comment>({}); // BehaviorSubject of Comment type. You can know when a new comment is received.
  private subscription: any

  constructor(private http: HttpClient) { 
    if (environment.android || environment.windows) {
      this.webSocketURL = this.webSocketURL.replace(environment.apiUrl, window.localStorage.getItem('apiUrl') || environment.apiUrl);
    }
  }



  /* ---------------------------- REALTIME SECTION ---------------------------- */


  /**
   * Connect to the WebSocket. Subscribe to the topic '/topic/comment/{postId}', 
   * that URL is the endpoint for the WebSocket configuration in the backend with @SendTo annotation.
   * Remember to disconnect from the WebSocket when the component is destroyed.
   * @param postId - The id of the post.
   * @example
   * this.commentService.connectWebSocket(postId);
   * 
   * ngOnDestroy() {
   *  if (this.post.id) this.commentService.disconnect(this.post.id);
   * }
   */
  connectWebSocket(postId: string) {
    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      this.subscription = this.stompClient.subscribe(`/topic/comment/${postId}`, (comment: IMessage) => {
        this.commentSubject.next(JSON.parse(comment.body));
      }),
      (error: any) => {
        console.error(error);
      }
    });
  }

  /**
   * Get the comments observable.
   * Remember to unsubscribe from the observable when the component is destroyed.
   * @returns the comment observable.
   * @example
   * subscriptionComments: Subscription = new Subscription();
   * 
   * this.subscriptionComments = this.commentService.getCommentsObservable().subscribe({
   *  next: (comment) => {
   *   console.log(comment);
   *   this.comments.unshift({ ...comment, createdDate: 'now' });
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   * 
   * ngOnDestroy() {
   *  this.subscriptionComments.unsubscribe();
   * }
   */
  getCommentsObservable(): Observable<Comment> {
    return this.commentSubject.asObservable();
  }

  /**
   * Disconnect from the WebSocket.
   */
  disconnect() {
    if(this.subscription) this.subscription.unsubscribe();
    if(Object.keys(this.stompClient).length) {
      this.stompClient.deactivate();
      this.stompClient.disconnect();
    }
  }

  /**
   * Send a comment to the WebSocket. /app is config in setApplicationDestinationPrefixes method in WebSocketConfig.java 
   * and '/app/comment/{postId}' is the endpoint for the WebSocket configuration in the backend with @MessageMapping annotation.
   * @param comment - The comment object.
   */
  sendComment(comment: Comment) {
    if(comment.parentCommentId) return;
    this.stompClient.publish({ 
      headers: {
        'token': localStorage.getItem('access_token') || '', // Send the token in the header to authenticate the user.
      },
      destination: `/app/comment/${comment.postId}`, 
      body: JSON.stringify(comment) 
    });
  }



  /* ---------------------------- CRUD SECTION ---------------------------- */


  getCommentById(commentId: string): Observable<Comment> {
    const url = `${this.apiURL}/${commentId}`;
    return this.http.get<Comment>(url);
  }
  
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
    const url = `${this.apiURL}/post/${postId}`;
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
