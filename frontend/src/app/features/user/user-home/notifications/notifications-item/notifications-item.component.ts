import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    public router: Router,
  ) { }


  /**
   * Check if the URL is a video by the extension ('mp4', 'webm', 'ogg').
   * @param url 
   * @returns true if the URL is a video, false otherwise.
   */
  isVideo(url: string | undefined): boolean {
    if (!url) return false;
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
    const extension = url.split('.').pop();
    return extension ? videoExtensions.includes(extension) : false;
  }
  
}
