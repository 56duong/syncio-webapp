import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Post } from '../interfaces/post';
import { environment } from 'src/environments/environment';
import {map} from "rxjs/operators";
import { EngagementMetricsDTO } from '../interfaces/engagement-metrics';

@Injectable({
  providedIn: 'root',
})

export class PostService {
  private apiURL = environment.apiUrl + 'api/v1/posts';

  private newPostCreated = new BehaviorSubject<any>(null); // Observable to notify the FeedComponent to add the new post to the top of the feed.
  private postReported = new BehaviorSubject<any>(null); // Observable to notify the FeedComponent to add the new post to the top of the feed.
  constructor(private http: HttpClient) {}

  // new - load 10 posts at a time
  getPosts(pageNumber: number, pageSize: number): Observable<Post[]> {
    const param = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    // gọi api lấy danh sách các bài post từ csdl theo số trang và số bài post trên 1 trang
    // dùng pipe.map để lấy mảng các bài post từ mục content của Page
    return this.http.get<any>(this.apiURL, { params: param }).pipe(map(response => response.content));
  }

  /**
   * Get posts from the users that the current user is following.
   * @param pageNumber 
   * @param pageSize 
   * @returns a page of posts from the users that the current user is following.
   * @example
   * this.postService.getPostsFollowing(1, 10).subscribe({
   *  next: (posts) => {
   *    this.posts = posts.content;
   *  },
   *  error: (error) => {
   *    console.error(error);
   *  }
   * }); 
   */
  getPostsFollowing(pageNumber: number, pageSize: number): Observable<Post[]> {
    const url = `${this.apiURL}/following`;
    const param = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    return this.http.get<any>(url, { params: param });
  }

  /**
   * Get posts that the current user has interacted with.
   * @param pageNumber 
   * @param pageSize 
   * @param postIds 
   * @returns a page of posts that the current user has interacted with.
   * @example
   * this.postService.getPostsInterests(1, 10, postIds).subscribe({
   *  next: (posts) => {
   *    this.posts = posts.content;
   *  },
   *  error: (error) => {
   *    console.error(error);
   *  }
   * }); 
   */
  getPostsInterests(pageNumber: number, pageSize: number, postIds: string[]): Observable<Post[]> {
    const url = `${this.apiURL}/interests`;
    const param = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    return this.http.post<any>(url, postIds, { params: param });
  }

  /**
   * Get the rest of the posts except the following and interests posts
   * @param pageNumber 
   * @param pageSize 
   * @param postIds 
   * @returns 
   */
  getPostsFeed(pageNumber: number, pageSize: number, postIds: string[]): Observable<any> {
    const url = `${this.apiURL}/feed`;
    const param = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    };
    return this.http.post<any>(url, postIds, { params: param });
  }

  /**
   * Get a post by id.
   * @param id - The id of the post.
   * @returns the post object. 
   */
  getPostById(id: string): Observable<Post> {
    const url = `${this.apiURL}/details/${id}`;
    return this.http.get<Post>(url);
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

  getEngagementMetrics(days: number): Observable<EngagementMetricsDTO> {
    return this.http.get<EngagementMetricsDTO>(`${this.apiURL}/engagement-metrics?days=${days}`);
  }

  setPostReportedInAdmin(post: any) {
    this.postReported.next(post);
  }

  getPostReportedInAdmin(): Observable<any> {
    return this.postReported.asObservable();
  }

  isPostCreatedByUserIFollow(userId: string): Observable<boolean> {
    const url = `${this.apiURL}/user/${userId}`;
    return this.http.get<boolean>(url);
  }

  getAllPostsByUserId(userId: string): Observable<Post[]> {
    const url = `${this.apiURL}/all-posts/${userId}`;
    return this.http.get<Post[]>(url);
  }

  /**
   * 
   * @param userId 
   * @param pageNumber 
   * @param pageSize 
   * @param isDesc false for ascending order, true for descending order 
   * @returns 
   */
  getPostsByUserId(userId: string, pageNumber: number, pageSize: number, isDesc: boolean): Observable<any> {
    const params = { 
      pageNumber: pageNumber.toString(), 
      pageSize: pageSize.toString(),
      isDesc: isDesc.toString()
    };
    const url = `${this.apiURL}/${userId}/posts`;
    return this.http.get<any>(url, { params });
  }

  /**
   * Get posts by user id for not login user
   * @param userId 
   * @param pageNumber 
   * @param pageSize 
   * @param isDesc false for ascending order, true for descending order 
   * @returns 
   */
  getPostsByUserIdNotLoggedIn(userId: string, pageNumber: number, pageSize: number, isDesc: boolean): Observable<any> {
    const params = { 
      pageNumber: pageNumber.toString(), 
      pageSize: pageSize.toString(),
      isDesc: isDesc.toString()
    };
    const url = `${this.apiURL}/user/not-login/${userId}`;
    return this.http.get<any>(url, { params });
  }

}
