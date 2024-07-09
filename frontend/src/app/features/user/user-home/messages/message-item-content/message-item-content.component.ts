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
}
