import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageRoom } from '../interfaces/message-room';

@Injectable({
  providedIn: 'root'
})

export class MessageRoomService {

  private apiURL = environment.apiUrl + 'api/v1/messagerooms';
  
  constructor(private http: HttpClient) {}

  /**
   * Find all rooms with at least one message content and user id
   * @param userId - The user id.
   * @returns array of message rooms.
   * @example
   * this.messageRoomMembersService.getMessageRoomsByUserId(userId).subscribe({
   *   next: (messageRooms) => {
   *     this.messageRooms = messageRooms;
   *   },
   *   error: (error) => {
   *     console.log(error);
   *   }
   * })
   */
  getMessageRoomsByUserId(userId: string): Observable<MessageRoom[]> {
    const url = `${this.apiURL}/user/${userId}`;
    return this.http.get<MessageRoom[]>(url);
  }

  /**
   * Create a message room with users. It also check if the room already exists.
   * @param userIds - The user ids.
   * @returns If the room already exists, return the room. If not, create a new room. 
   * @example
   * this.messageRoomService.createMessageRoomWithUsers(userIds).subscribe({
   *  next: (messageRoom) => {
   *   this.selectedMessageRoom = messageRoom;
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   */
  createMessageRoomWithUsers(userIds: string[]): Observable<MessageRoom> {
    const url = `${this.apiURL}/create`;
    return this.http.post<MessageRoom>(url, userIds);
  }

  /**
   * Find an exact room with members.
   * @param userIds - The user ids.
   * @returns the MessageRoom object.
   * @example
   * this.messageRoomService.findExactRoomWithMembers(userIds).subscribe({
   *  next: (messageRoom) => {
   *   this.selectedMessageRoom = messageRoom;
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   */
  findExactRoomWithMembers(userIds: string[]): Observable<MessageRoom> {
    const url = `${this.apiURL}/exists`;
    return this.http.get<MessageRoom>(url, { params: { userIds: userIds } });
  }

}
