import { Component, Input } from '@angular/core';
import { MessageContent, MessageContentTypeEnum } from 'src/app/core/interfaces/message-content';

@Component({
  selector: 'app-message-item-content',
  templateUrl: './message-item-content.component.html',
  styleUrls: ['./message-item-content.component.scss']
})

/**
 * Component for displaying the content inside a message-item.
 */
export class MessageItemContentComponent {
  @Input() messageContent: MessageContent = {} as MessageContent;
  MessageContentTypeEnum = MessageContentTypeEnum;

  fallbackAttemptedImages = new Set<string>(); // Tracking fallback attempts

  /**
   * Handles the error when an image fails to load in local, and tries to load it from the firebase storage.
   * @param event 
   * @param img 
   */
  handleImageError(event: any, img: string) {
    if (!this.fallbackAttemptedImages.has(img)) {
      event.target.src = 'assets/images/no-image-available.jpg'; // Set the fallback URL
      this.fallbackAttemptedImages.add(img); // Mark the fallback as attempted
    } 
    else {
      // Optionally handle the case where even the fallback URL fails
      console.log(`Both primary and fallback URLs failed for image: ${img}`);
    }
  }
}
