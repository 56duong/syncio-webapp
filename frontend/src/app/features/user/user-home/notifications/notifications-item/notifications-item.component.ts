import { Component, Input } from '@angular/core';
import { ActionEnum, Notification, StateEnum } from 'src/app/core/interfaces/notification';

@Component({
  selector: 'app-notifications-item',
  templateUrl: './notifications-item.component.html',
  styleUrls: ['./notifications-item.component.scss']
})

export class NotificationsItemComponent {
  @Input() notification!: Notification;
  ActionEnum = ActionEnum;
  StateEnum = StateEnum;
}
