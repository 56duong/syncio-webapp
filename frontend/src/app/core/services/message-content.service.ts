import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MessageContent } from '../interfaces/message-content';
import { IMessage, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})

export class MessageContentService {

  private apiURL = environment.apiUrl + 'api/v1/messagecontents';

  private webSocketURL = environment.apiUrl + 'live'; // WebSocket URL with 'live' is the endpoint for the WebSocket configuration in the backend. In WebSocketConfig.java, the endpoint is '/live'.

  private connections: Map<string, any> = new Map(); // Map to store the connections for each message room ID.

  constructor(private http: HttpClient) {}



  /* ---------------------------- REALTIME SECTION ---------------------------- */

  /**
   * Connect to the WebSocket server for the given message room ID.
   * @param messageRoomId 
   * @returns 
   */
  connectWebSocket(messageRoomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if a connection for the given messageRoomId already exists
      if (this.connections.has(messageRoomId)) {
        // If connection exists, resolve immediately without creating a new connection
        resolve();
        return; // Exit the function to prevent creating a new connection
      }

      const socket = new SockJS(this.webSocketURL);
      const stompClient = Stomp.over(socket);
      const messageContentSubject: BehaviorSubject<MessageContent> = new BehaviorSubject<MessageContent>({});

      stompClient.connect({}, () => {
        const subscription = stompClient.subscribe(`/topic/messagecontent/${messageRoomId}`, (messageContent: IMessage) => {
          messageContentSubject.next(JSON.parse(messageContent.body));
        });
        // Store the connection or subscription as needed
        this.connections.set(messageRoomId, { stompClient, subscription, messageContentSubject });
        resolve(); // Resolve the promise here
      }, (error: any) => {
        reject(error); // Reject the promise on error
      });
    });
  }


  /**
   * Get the connection for the given message room ID. 
   * Connection contains the stompClient, subscription, and messageContentSubject.
   * @param messageRoomId 
   * @returns 
   */
  getConnection(messageRoomId: string) {
    return this.connections.get(messageRoomId);
  }


  /**
   * Get the message content observable for the given message room ID.
   * This observable will emit new message content whenever a new message content is received.
   * @param messageRoomId 
   * @returns 
   */
  getMessageContentsObservable(messageRoomId: string): Observable<MessageContent> {
    const connection = this.getConnection(messageRoomId);
    if(connection && connection.messageContentSubject) {
      return connection.messageContentSubject.asObservable();
    }
    return new Observable();
  }


  /**
   * Disconnect from the WebSocket server for the given message room ID.
   * @param messageRoomId 
   */
  disconnect(messageRoomId: string) {
    const connection = this.getConnection(messageRoomId);
    if(connection) {
      connection.subscription.unsubscribe();
      connection.stompClient.deactivate();
      connection.stompClient.disconnect();
      this.connections.delete(messageRoomId);
    }
  }

  
  /**
   * Send message content to the WebSocket server for the given message room ID.
   * @param messageContent 
   * @returns 
   */
  sendMessageContent(messageContent: MessageContent) {
    if(!messageContent.messageRoomId) return;
    const connection = this.getConnection(messageContent.messageRoomId);
    if (connection && connection.stompClient) {
      connection.stompClient.publish({ 
        headers: {
          'token': localStorage.getItem('access_token') || '', // Send the token in the header to authenticate the user.
        },
        destination: `/app/messagecontent/${messageContent.messageRoomId}`, 
        body: JSON.stringify(messageContent)
      });
    } 
    else {
      console.error('Connection not found or not established for room ID:', messageContent.messageRoomId);
    }
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

  /**
   * Upload photos with FormData containing the 'photos' key with the value of the photos.
   * @param formData - The FormData object containing the photos.
   * @returns array of photo URLs.
   */
  uploadPhotos(formData: FormData): Observable<string[]> {
    return this.http.post<string[]>(`${this.apiURL}/upload`, formData);
  }

}
