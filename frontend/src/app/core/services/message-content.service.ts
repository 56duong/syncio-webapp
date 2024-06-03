import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageContent } from '../interfaces/message-content';
import { CompatClient, IMessage, Stomp, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})

export class MessageContentService {

  private apiURL = environment.apiUrl + 'api/v1/messagecontents';

  private webSocketURL = environment.apiUrl + 'live'; // WebSocket URL with 'live' is the endpoint for the WebSocket configuration in the backend. In WebSocketConfig.java, the endpoint is '/live'.
  private stompClient: CompatClient = {} as CompatClient;
  private messageContentSubject: BehaviorSubject<MessageContent> = new BehaviorSubject<MessageContent>({}); // BehaviorSubject of MessageContent type. You can know when a new messageContent is received.
  private subscription: StompSubscription = {} as StompSubscription;

  constructor(private http: HttpClient) {}



  /* ---------------------------- REALTIME SECTION ---------------------------- */


  /**
   * Connect to the WebSocket. Subscribe to the topic '/topic/messagecontent/{messageRoomId}', 
   * that URL is the endpoint for the WebSocket configuration in the backend with @SendTo annotation.
   * Remember to disconnect from the WebSocket when the component is destroyed.
   * @param messageRoomId - The id of the post.
   * @example
   * this.messageContentService.connectWebSocket(messageRoomId);
   * 
   * ngOnDestroy() {
   *  if (this.messageRoom.id) this.messageContentService.disconnect(this.messageRoom.id);
   * }
   */
  connectWebSocket(messageRoomId: string) {
    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(`/topic/messagecontent/${messageRoomId}`, (messageContent: IMessage) => {
        this.messageContentSubject.next(JSON.parse(messageContent.body));
      });
    });
  }

  /**
   * Get the messageContents observable.
   * Remember to unsubscribe from the observable when the component is destroyed.
   * @returns the messageContent observable.
   * @example
   * subscriptionMessageContents: Subscription = new Subscription();
   * 
   * this.subscriptionMessageContents = this.messageContentService.getMessageContentsObservable().subscribe({
   *  next: (messageContent) => {
   *   console.log(messageContent);
   *   this.messageContents.unshift({ ...messageContent, createdDate: 'now' });
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   * 
   * ngOnDestroy() {
   *  this.subscriptionMessageContents.unsubscribe();
   * }
   */
  getMessageContentsObservable(): Observable<MessageContent> {
    return this.messageContentSubject.asObservable();
  }

  /**
   * Disconnect from the WebSocket.
   * @param messageRoomId - The id of the post.
   */
  disconnect(messageRoomId: string) {
    this.stompClient.unsubscribe(`/topic/messagecontent/${messageRoomId}`);
    this.stompClient.deactivate();
    this.stompClient.disconnect();
  }

  /**
   * Send a messageContent to the WebSocket. /app is config in setApplicationDestinationPrefixes method in WebSocketConfig.java 
   * and '/app/messageContent/{postId}' is the endpoint for the WebSocket configuration in the backend with @MessageMapping annotation.
   * @param messageContent - The messageContent object.
   */
  sendMessageContent(messageContent: MessageContent) {
    this.stompClient.publish({ 
      destination: `/app/messagecontent/${messageContent.messageRoomId}`, 
      body: JSON.stringify(messageContent) 
    });
  }



  /* ---------------------------- CRUD SECTION ---------------------------- */


  /**
   * Get all message content by room id.
   * @param roomId - The room id.
   * @returns array of message content ordered by dateSent ascending.
   * @example
   * this.messageContentService.getMessageContentByRoomId(roomId).subscribe({
   *  next: (messageContent) => {
   *   this.messageContent = messageContent;
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * })
   */
  getMessageContentByRoomId(roomId: string): Observable<MessageContent[]> {
    const url = `${this.apiURL}/${roomId}`;
    return this.http.get<MessageContent[]>(url);
  }

}
