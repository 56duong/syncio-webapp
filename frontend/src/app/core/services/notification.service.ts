import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Notification } from '../interfaces/notification';
import { CompatClient, IMessage, Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  private apiURL = environment.apiUrl + 'api/v1/notifications';

  private webSocketURL = environment.apiUrl + 'api/live'; // WebSocket URL with 'api/live' is the endpoint for the WebSocket configuration in the backend. In WebSocketConfig.java, the endpoint is '/api/live'.
  private stompClient: CompatClient = {} as CompatClient;
  private notificationSubject: BehaviorSubject<Notification> = new BehaviorSubject<Notification>({}); // BehaviorSubject of Notification type. You can know when a new notification is received.
  private subscription: any
  
  private isConnected = false; // Check if the WebSocket is connected. Cause the connectWebSocket method to be called only once for each user.

  constructor(private http: HttpClient) {  
    if (environment.android || environment.windows) {
      this.webSocketURL = this.webSocketURL.replace(environment.apiUrl, window.localStorage.getItem('apiUrl') || environment.apiUrl);
    }
  }


  /* ---------------------------- REALTIME SECTION ---------------------------- */


  /**
   * Connect to the WebSocket. Subscribe to the topic '/topic/notification/{userId}', 
   * that URL is the endpoint for the WebSocket configuration in the backend with @SendTo annotation.
   * Remember to disconnect from the WebSocket when the component is destroyed.
   * @param userId - The id of the user.
   * @example
   * this.notificationService.connectWebSocket(userId);
   * 
   * ngOnDestroy() {
   *  if (this.user.id) this.notificationService.disconnect(this.user.id);
   * }
   */
  connectWebSocket(userId: string) {
    if(this.isConnected) return;
    const socket = new SockJS(this.webSocketURL);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      this.subscription = this.stompClient.subscribe(`/topic/notification/${userId}`, (notification: IMessage) => {
        this.notificationSubject.next(JSON.parse(notification.body));
      }),
      (error: any) => {
        console.error(error);
      }
    });
    this.isConnected = true;
  }

  /**
   * Get the notifications observable.
   * Remember to unsubscribe from the observable when the component is destroyed.
   * @returns the notification observable.
   * @example
   * subscriptionNotifications: Subscription = new Subscription();
   * 
   * this.subscriptionNotifications = this.notificationService.getNotificationsObservable().subscribe({
   *  next: (notification) => {
   *   console.log(notification);
   *  },
   *  error: (error) => {
   *   console.log(error);
   *  }
   * });
   * 
   * ngOnDestroy() {
   *  this.subscriptionNotifications.unsubscribe();
   * }
   */
  getNotificationsObservable(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  /**
   * Disconnect from the WebSocket.
   */
  disconnect() {
    if (this.isConnected) {
      if(this.subscription) this.subscription.unsubscribe();
      if(Object.keys(this.stompClient).length) {
        this.stompClient.deactivate();
        this.stompClient.disconnect();
      }
      this.isConnected = false;
    }
  }

  /**
   * Send a notification to the WebSocket. /app is config in setApplicationDestinationPrefixes method in WebSocketConfig.java 
   * and '/app/notification/{userId}' is the endpoint for the WebSocket configuration in the backend with @MessageMapping annotation.
   * @param notification - The notification object.
   */
  sendNotification(notification: Notification) {
    let date = new Date();
    notification.createdDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString(),
    this.stompClient.publish({ 
      headers: {
        'token': localStorage.getItem('access_token') || '', // Send the token in the header to authenticate the user.
      },
      destination: `/app/notification/${notification.recipientId}`, 
      body: JSON.stringify(notification) 
    });
  }



  /* ---------------------------- CRUD SECTION ---------------------------- */

  /**
   * Get all notifications by recipient id.
   * @param recipientId - The recipient id.
   * @returns an observable of notifications in last month. Order by createdDate in descending order.
   */
  getNotificationsByRecipientId(recipientId: string): Observable<Notification[]> {
    const url = `${this.apiURL}/${recipientId}`;
    return this.http.get<Notification[]>(url);
  }

  /**
   * Update the state of a list of notifications.
   * @param notifications - The list of notifications with the new state. 
   * @example
   * async saveNotificationsState() {
   *  await this.notificationService.updateNotifications(notificationsToUpdate);
   * }
   */
  updateNotifications(notifications: Notification[]): Promise<void> {
    return firstValueFrom(this.http.patch<void>(this.apiURL, notifications));
  }

}