import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})

export class MessageItemComponent {
  @Input() messageContent: any;
  @Input() currentUser: any;
  @Input() messageRoom: any;

  /**
   * Scroll to the message with the given id
   * @param id The id of the message to scroll to
   */
  scrollToMessage(id: string): void {
    const element = document.getElementById(id);
    element?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center',
      inline: 'center' 
    });
  }

  isCurrentUser(): boolean {
    return this.messageContent.user?.id === this.currentUser.id;
  }

  shouldShowUsername(): boolean {
    const isDifferentUser = this.messageContent.user?.id != this.currentUser.id;
    const isReply = this.messageContent.replyTo;
    const isGroup = this.messageRoom.group;

    return (isGroup && isDifferentUser) || isReply;
  }

  getUsername(): string {
    return this.messageContent.user?.username == 
      this.currentUser.username 
        ? 'You' 
        : this.messageContent.user?.username;
  }

  getReplyToUsername(): string {
    return this.messageContent.replyTo.user?.username == 
      this.currentUser.username 
        ? 'you' 
        : this.messageContent.replyTo.user?.username;
  }
}
