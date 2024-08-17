import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserSetting, WhoCanAddYouToGroupChat, WhoCanSendYouNewMessage } from '../interfaces/user-setting';

@Injectable({
  providedIn: 'root'
})

export class UserSettingService {

  private apiURL = environment.apiUrl + 'api/v1/usersettings';


  constructor(
    private http: HttpClient
  ) { }


  getUserSetting(): Observable<UserSetting> {
    return this.http.get<UserSetting>(this.apiURL);
  }


  updateWhoCanAddYouToGroupChat(whoCanAddYouToGroupChat: WhoCanAddYouToGroupChat): Observable<Boolean> {
    const url = this.apiURL + '/who-can-add-you-to-group-chat';
    return this.http.post<Boolean>(url, whoCanAddYouToGroupChat);
  }


  updateWhoCanSendYouNewMessage(whoCanSendYouNewMessage: WhoCanSendYouNewMessage): Observable<Boolean> {
    const url = this.apiURL + '/who-can-send-you-new-message';
    return this.http.post<Boolean>(url, whoCanSendYouNewMessage);
  }


  /**
   * Check who can send you a new message in a chat of 2 users.
   * Use in case the message already exists, but have no message content and the current user access the room by the link.
   * @param roomId 
   * @returns 
   */
  checkWhoCanSendYouNewMessage(roomId: string): Observable<Boolean> {
    const url = this.apiURL + '/check-who-can-send-you-new-message/' + roomId;
    return this.http.get<Boolean>(url);
  }


  updateImageSearch(formData: FormData): Observable<void> {
    const url = this.apiURL + '/update-image-search';
    return this.http.post<void>(url, formData);
  }

  searchByImage(formData: FormData): Observable<any> {
    const url = this.apiURL + '/search-by-image';
    return this.http.post<any>(url, formData);
  }


  deleteImageSearch(): Observable<boolean> {
    const url = this.apiURL + '/delete-image-search';
    return this.http.delete<boolean>(url);
  }

}
