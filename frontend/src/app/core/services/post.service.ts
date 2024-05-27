import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../interfaces/post';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiURL = environment.apiUrl + 'api/v1/posts';

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

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(this.apiURL, post);
  }
}
