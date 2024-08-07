import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Story } from '../interfaces/story';
import { UserStory } from '../interfaces/user-story';

@Injectable({
  providedIn: 'root'
})

export class StoryService {
  private apiURL = environment.apiUrl + 'api/v1/stories';

  constructor(private http: HttpClient) { }

  /**
   * Create a new story.
   * @param story
   * @returns id of the created story.
   */
  createStory(formData: FormData): Observable<string> {
    return this.http.post<string>(this.apiURL, formData);
  }

  /**
   * Get all stories created by a user in the last 24 hours
   * @param userId
   * @returns list of stories
   */
  getStoriesByUserId(userId: string): Observable<Story[]> {
    const url = `${this.apiURL}/${userId}`;
    return this.http.get<Story[]>(url);
  }

  /**
   * Get all users with at least one story created in the last 24 hours
   * @returns array of stories.
   */
  getUsersWithStories(): Observable<UserStory[]> {
    const url = `${this.apiURL}/user-with-stories`;
    return this.http.get<UserStory[]>(url);
  }

  getUserStory(userId: string): Observable<UserStory> {
    const url = `${this.apiURL}/user-with-stories/${userId}`;
    return this.http.get<UserStory>(url);
  }

}
