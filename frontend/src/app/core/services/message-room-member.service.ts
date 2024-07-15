import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MessageRoomMember } from '../interfaces/message-room-member';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MessageRoomMemberService {

  private apiURL = environment.apiUrl + 'api/v1/messageroommembers';
  
  constructor(private http: HttpClient) {}

  getMessageRoomMembersByRoomId(roomId: string): Observable<MessageRoomMember[]> {
    const url = `${this.apiURL}/${roomId}`;
    return this.http.get<MessageRoomMember[]>(url);
  }

  updateLastSeenMessage(roomId: string): Observable<string> {
    const url = `${this.apiURL}/user/${roomId}`;
    return this.http.put<string>(url, {});
  }

  addMessageRoomMembers(roomId: string, messageRoomMembers: string[]): Observable<MessageRoomMember[]> {
    const url = `${this.apiURL}/${roomId}`;
    return this.http.post<MessageRoomMember[]>(url, messageRoomMembers);
  }

  removeMessageRoomMember(roomId: string, userId: string): Observable<MessageRoomMember> {
    const url = `${this.apiURL}/${roomId}/${userId}`;
    return this.http.delete<MessageRoomMember>(url);
  }

  leaveChat(roomId: string): Observable<void> {
    const url = `${this.apiURL}/${roomId}/leave`;
    return this.http.delete<void>(url);
  }

  hasOtherAdmins(roomId: string): Observable<boolean> {
    const url = `${this.apiURL}/${roomId}/has-other-admins`;
    return this.http.get<boolean>(url);
  }

  makeAdmin(roomId: string, userId: string): Observable<void> {
    const url = `${this.apiURL}/${roomId}/${userId}/make-admin`;
    return this.http.put<void>(url, {});
  }

  removeAdmin(roomId: string, userId: string): Observable<void> {
    const url = `${this.apiURL}/${roomId}/${userId}/remove-admin`;
    return this.http.put<void>(url, {});
  }

}
