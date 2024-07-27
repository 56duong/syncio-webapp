import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageRoom } from '../interfaces/message-room';
import { CompatClient, IMessage, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})

export class MessageRoomService {

  private apiURL = environment.apiUrl + 'api/v1/messagerooms';

  private webSocketURL = environment.apiUrl + 'live'; // WebSocket URL with 'live' is the endpoint for the WebSocket configuration in the backend. In WebSocketConfig.java, the endpoint is '/live'.
  
  /**
   * WebSocket client for new message group.
   */
  private stompClientNewMessageGroup: CompatClient = {} as CompatClient;
  /**
   * BehaviorSubject of MessageRoom type. You can know when a new message room is received.
   */
  private newMessageGroupSubject: BehaviorSubject<MessageRoom> = new BehaviorSubject<MessageRoom>({});
  /**
   * Subscription for new message group.
   */
  private newMessageGroupSubscription: any
  
  /**
   * WebSocket client for first message.
   * This is used when the user sends the first message to another user.
   * The user will not be in the group.
   */
  private stompClientFirstMessage: CompatClient = {} as CompatClient;
  /**
   * BehaviorSubject of MessageRoom type. You can know when a new message room is received.
   */
  private messageRoomSubjectFirstMessage: BehaviorSubject<MessageRoom> = new BehaviorSubject<MessageRoom>({});
  /**
   * Subscription for first message.
   */
  private subscriptionFirstMessage: any

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { 
    if (environment.android) {
      this.webSocketURL = this.webSocketURL.replace(environment.apiUrl, window.localStorage.getItem('apiUrl') || environment.apiUrl);
    }
  }


  connectWebSocketNewMessageGroup() {
    const socket = new SockJS(this.webSocketURL);
    this.stompClientNewMessageGroup = Stomp.over(socket);

    this.stompClientNewMessageGroup.connect({id: this.tokenService.extractUserIdFromToken()}, () => {    
      this.newMessageGroupSubscription = this.stompClientNewMessageGroup.subscribe(`/user/queue/newMessageRoom`, (messageContent: IMessage) => {
        this.newMessageGroupSubject.next(JSON.parse(messageContent.body));
      }),
      (error: any) => {
        console.error(error);
      }
    });
  }


  /**
   * Get the new message group observable.
   * This observable will emit new message room whenever a new message room is received.
   * Remember to call connectWebSocketNewMessageGroup() before calling this method.
   * @returns 
   */
  getNewMessageGroupObservable(): Observable<MessageRoom> {
    return this.newMessageGroupSubject.asObservable();
  }


  connectWebSocketFirstMessage() {
    const socket = new SockJS(this.webSocketURL);
    this.stompClientFirstMessage = Stomp.over(socket);

    this.stompClientFirstMessage.connect({id: this.tokenService.extractUserIdFromToken()}, () => {    
      this.subscriptionFirstMessage = this.stompClientFirstMessage.subscribe(`/user/queue/newMessageRoomNotGroup`, (comment: IMessage) => {
        this.messageRoomSubjectFirstMessage.next(JSON.parse(comment.body));
      });
    });
  }


  /**
   * Get the message room observable for the first message.
   * This observable will emit new message room whenever a new message room is received.
   * Remember to call connectWebSocketFirstMessage() before calling this method.
   */
  getMessageRoomsFirstMessageObservable(): Observable<MessageRoom> {
    return this.messageRoomSubjectFirstMessage.asObservable();
  }


  /**
   * Disconnect from the WebSocket.
   */
  disconnect() {
    if(this.newMessageGroupSubscription) this.newMessageGroupSubscription.unsubscribe();
    if(Object.keys(this.stompClientNewMessageGroup).length) {
      this.stompClientNewMessageGroup.deactivate();
      this.stompClientNewMessageGroup.disconnect();
    }
    if(this.subscriptionFirstMessage) this.subscriptionFirstMessage.unsubscribe();
    if(Object.keys(this.stompClientFirstMessage).length) {
      this.stompClientFirstMessage.deactivate();
      this.stompClientFirstMessage.disconnect();
    }
  }


  /**
   * Use this method when the user sends the first message to another user. Not in the group.
   * It will send a message to the recipient and append the message room to the message room list of the recipient.
   * @param userId 
   * @param messageRoomId 
   * @returns 
   */
  sendFirstMessage(userId: string, messageRoomId: string) {
    const url = `${this.apiURL}/send-first-message-to-user/${userId}/${messageRoomId}`;
    return this.http.post(url, null);
  }


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

  getMessageRoomById(messageRoomId: string): Observable<MessageRoom> {
    const url = `${this.apiURL}/${messageRoomId}`;
    return this.http.get<MessageRoom>(url);
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

  /**
   * Update the message room name.
   * @param messageRoomId 
   * @param name 
   * @returns the object containing the name.
   * @example
   * this.messageRoomService.updateMessageRoomName(this.messageRoom.id, this.newMessageRoomName).subscribe({
   *  next: (messageRoomName) => {
   *    this.messageRoom.name = messageRoomName['name'];
   *  },
   *  error: (error) => {
   *    console.log(error);
   *  }
   * });
   */
  updateMessageRoomName(messageRoomId: string, name: string): Observable<any> {
    const url = `${this.apiURL}/update-name/${messageRoomId}`;
    return this.http.post<any>(url, { name: name });
  }
 
}
