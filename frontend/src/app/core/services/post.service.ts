import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Post } from '../interfaces/post';
import { environment } from 'src/environments/environment';
import {map} from "rxjs/operators";

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
    return this.http.get<any>(this.apiURL, { params: param }).pipe(map(response => response.content));
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

<<<<<<< HEAD
  /**
   * Set the new post created to notify the FeedComponent to add the new post to the top of the feed.
   * @param post - The post object.
   */
  setNewPostCreated(post: Post) {
    this.newPostCreated.next(post);
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiURL}/${id}`);
  }
=======
>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63
}
