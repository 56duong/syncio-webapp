import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StoryView } from '../interfaces/story-view';

@Injectable({
  providedIn: 'root'
})

export class StoryViewService {

  private apiURL = environment.apiUrl + 'api/v1/storyviews';

  constructor(private http: HttpClient) { }

  /**
   * Save all story views
   * @param storyViews - List of story views
   * @returns void
   */
  saveAllStoryViews(storyViews: StoryView[]): Observable<void> {
    return this.http.post<void>(this.apiURL, storyViews);
  }

}
