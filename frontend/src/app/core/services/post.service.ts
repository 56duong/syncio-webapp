import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Post } from '../interfaces/post';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { EngagementMetricsDTO } from '../interfaces/engagement-metrics';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiURL = environment.apiUrl + 'api/v1/posts';
  private newPostCreated = new BehaviorSubject<any>(null);

  // Observable to notify the FeedComponent to add the new post to the top of the feed.

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
  // old
  // getPosts(): Observable<Post[]> {
  //   return this.http.get<Post[]>(this.apiURL);
  // }
  // old

  // new - load 10 posts at a time
  getPosts(pageNumber: number, pageSize: number): Observable<Post[]> {
    const param = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    // gọi api lấy danh sách các bài post từ csdl theo số trang và số bài post trên 1 trang
    // dùng pipe.map để lấy mảng các bài post từ mục content của Page
    return this.http
      .get<any>(this.apiURL, { params: param })
      .pipe(map((response) => response.content));
  }

  getTotalPostsCount(): Observable<number> {
    // Assuming the API provides total post count in the response
    return this.http.get<any>(this.apiURL, { params: { pageNumber: '1', pageSize: '1' } })
      .pipe(map(response => response.totalElements));
  }

  getPostReported(pageNumber: number, pageSize: number): Observable<Post[]> {
    const url = this.apiURL + '/reported';
    const param = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    // gọi api lấy danh sách các bài post từ csdl theo số trang và số bài post trên 1 trang
    // dùng pipe.map để lấy mảng các bài post từ mục content của Page
    return this.http
      .get<any>(url, { params: param })
      .pipe(map((response) => response.content));
  }

  getTotalPostReported(): Observable<number> {
    const url = this.apiURL + '/reported';
    return this.http.get<any>(url, { params: { pageNumber: '1', pageSize: '1' } })
      .pipe(map(response => response.totalElements));
  }

  getPostHidden(pageNumber: number, pageSize: number): Observable<Post[]> {
    const url = this.apiURL + '/flagged';
    const param = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };

    return this.http
      .get<any>(url, { params: param })
      .pipe(map((response) => response.content));
  }

  setFlagToTrue(postId: string): Observable<void> {
    const url = `${this.apiURL}/${postId}/flag`;
    return this.http.put<void>(url, null);
  }

  setFlagToFalse(postId: string): Observable<void> {
    const url = `${this.apiURL}/${postId}/unflag`;
    return this.http.put<void>(url, null);
  }

  /**
   * Get a post by id.
   * @param id - The id of the post.
   * @returns the post object. 
   */
  getPostById(id: string): Observable<Post> {
    const url = `${this.apiURL}/${id}`;
    return this.http.get<Post>(url);
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
  getNewPostCreated(): Observable<Post> {
    return this.newPostCreated.asObservable();
  }
  /**
   * Set the new post created to notify the FeedComponent to add the new post to the top of the feed.
   * @param post - The post object.
   */
  setNewPostCreated(post: Post) {
    this.newPostCreated.next(post);
  }

  getEngagementMetrics(days: number): Observable<EngagementMetricsDTO> {
    return this.http.get<EngagementMetricsDTO>(`${this.apiURL}/engagement-metrics?days=${days}`);
  }
}
