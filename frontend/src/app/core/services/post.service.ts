import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../interfaces/post';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiURL = environment.apiUrl + 'api/v1/posts';
  private newPostCreated = new BehaviorSubject<any>(null);

  private newPostCreated = new BehaviorSubject<any>(null); // Observable to notify the FeedComponent to add the new post to the top of the feed.

  constructor(private http: HttpClient) {}

  /**
   * Get all posts.
   * @returns array of posts.
   * @example
   * this.postService.getPosts().subscribe({
   *    next: (posts) => {
   *      this.posts = posts;
   *    },
   *    error: (error) => {
   *      console.log(error);
   *    }
   *  })
   */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiURL);
  }

  /**
   * Create a new post.
   * @param post
   * @returns id of the created post.
   */
  createPost(formData: FormData): Observable<string> {
    return this.http.post<string>(this.apiURL, formData);
  }

  /**
   * Set the new post created to notify the FeedComponent to add the new post to the top of the feed.
   * @param post - The post object.
   */
  setNewPostCreated(post: any) {
    this.newPostCreated.next(post);
  }

  /**
   * Get the new post created observable.
   * @returns the new post created observable.
   * @example
   * this.postService.getNewPostCreated().subscribe({
   *   next: (post) => {
   *    if (post) {
   *     this.posts.unshift(post);
   *    }
   *   }
   * })
   */
  getNewPostCreated(): Observable<any> {
    return this.newPostCreated.asObservable();
  }

  /**
   * Set the new post created to notify the FeedComponent to add the new post to the top of the feed.
   * @param post - The post object.
   */
  setNewPostCreated(post: any) {
    this.newPostCreated.next(post);
  }

  getNewPostCreated(): Observable<any | null> {
    return this.newPostCreated.asObservable();
  }
}
