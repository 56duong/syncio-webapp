import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification, StateEnum } from 'src/app/core/interfaces/notification';
import { NotificationService } from 'src/app/core/services/notification.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})

export class NotificationsComponent {
  @Input() showNotifications: boolean = false;
  @Output() onClose = new EventEmitter<void>(); 
  
  currentUserId: string = ''; // The id of the current logged-in user
  notifications: Notification[] = []; // The notifications array to show
  defaultNotifications: Notification[] = []; // The default notifications array to compare with the notifications array

  subscriptionNotifications: Subscription = new Subscription(); // Subscription to the notifications observable

  constructor(
    private notificationService: NotificationService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    
    if(!this.currentUserId) return;

    this.getNotificationsObservable();
    this.getNotifications();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['showNotifications']) {
      //if there are unseen notifications when opening the notifications
      if(this.showNotifications && this.isHasUnseenNotifications()) {
        // mark all notifications as seen
        this.notifications.map(notification => 
          notification.state = notification.state === StateEnum.UNSEEN ? StateEnum.SEEN_BUT_UNREAD : notification.state
        );
        this.toggleUnseenNotifications(false);
      }
    }
  }
  
  ngOnDestroy() {
    if(this.currentUserId) this.notificationService.disconnect();
    this.subscriptionNotifications.unsubscribe();
  }

  /**
   * Subscribe to the notifications observable to get the Notification object in real-time.
   */
  getNotificationsObservable() {
    this.subscriptionNotifications = this.notificationService.getNotificationsObservable().subscribe({
      next: (notification) => {
        if(notification.actionType !== 'FOLLOW') {
          //remove the existing notification(not follow) if it exists have the same targetId and actionType
          this.notifications = this.notifications.filter(n => n.targetId !== notification.targetId || n.actionType !== notification.actionType);
          this.defaultNotifications = this.defaultNotifications.filter(n => n.targetId !== notification.targetId || n.actionType !== notification.actionType);
        }
        // unshift the new notification to the beginning of the array
        this.notifications.unshift({ ...notification, createdDate: 'Just now' });
        this.defaultNotifications.unshift({ ...notification, createdDate: 'Just now' });
        this.toggleUnseenNotifications(true);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getNotifications() {
    this.notificationService.getNotificationsByRecipientId(this.currentUserId).subscribe({
      next: (response) => {
        this.notifications = [...response];
        // deep copy the response array to the defaultNotifications array
        this.defaultNotifications = response.map(object => ({ ...object }));
        if(this.isHasUnseenNotifications()) {
          this.toggleUnseenNotifications(true);
        }
      },
      error: (error) => {
        console.error('Error getting notifications:', error);
      },
    });
  }

  toggleUnseenNotifications(isUnseen: boolean) {
    if(isUnseen) {
      document.getElementById('NotificationsButton')?.classList.add('has-unseen-notifications');
    }
    else {
      document.getElementById('NotificationsButton')?.classList.remove('has-unseen-notifications');
    }
  }

  isHasUnseenNotifications(): boolean {
    return this.notifications.some(notification => notification.state === StateEnum.UNSEEN)
  }

  /**
   * Use when clicking on the notification to navigate to the target page or close the notifications.
   * @param notification
   */
  closeNotifications(notification?: Notification): void {
    this.showNotifications = false;
    this.onClose.emit();
    // If click on the notification, mark the notification as SEEN_AND_READ
    if(notification) notification.state = StateEnum.SEEN_AND_READ;
  }

  @HostListener('window:beforeunload')
  async saveNotificationsState() {
    // Compare the notifications array with the filteredDefaultNotifications array and get the notifications with the state is different from the filteredDefaultNotifications array
    let notificationsToUpdate = this.notifications.filter((notification, index) => notification.state !== this.defaultNotifications[index].state);

    // Remove the createdDate property from the notificationsToUpdate array ot prevent 'Just now'
    notificationsToUpdate = notificationsToUpdate.map(({ createdDate, ...rest }) => rest);

    // Update the notification state to the server
    if(notificationsToUpdate.length > 0) {
      await this.notificationService.updateNotifications(notificationsToUpdate);
    }
  }

}
