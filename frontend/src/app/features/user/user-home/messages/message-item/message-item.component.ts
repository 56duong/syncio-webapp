import { Component, Input } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { MessageContentTypeEnum } from 'src/app/core/interfaces/message-content';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss']
})

/**
 * Component for displaying a single message item.
 * Contains avatar, username, reply-to, message content, and timestamp.
 */
export class MessageItemComponent {
  @Input() messageContent: any;
  @Input() currentUser: any;
  @Input() messageRoom: any;

  MessageContentTypeEnum = MessageContentTypeEnum;
  membersAddedAsString: string = ''; // String of members added to the group

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    if(this.messageContent.type === MessageContentTypeEnum.NOTIFICATION_ADD_MEMBER) {
      this.getMembersAddedAsUsername(this.messageContent.message).then((result) => {
        this.membersAddedAsString = result;
      });
    }
  }

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

  /**
   * Get the members added to the group as a string of usernames.
   * @param userIds 
   * @returns 
   */
  async getMembersAddedAsUsername(userIds: string): Promise<string> {
    let userIdsArray = userIds.split(',');
    const includesCurrentUser = userIdsArray.includes(this.currentUser.id); // if the members added includes the current user
    userIdsArray = userIdsArray.filter(id => id !== this.currentUser.id);
  
    switch (userIdsArray.length) {
      case 0:
        return includesCurrentUser ? 'You' : '';
      case 1:
        if (includesCurrentUser) {
          const otherUsername = await this.fetchUsername(userIdsArray[0]);
          return `You and ${otherUsername}`;
        } else {
          return this.fetchUsername(userIdsArray[0]);
        }
      default:
        const otherUsernames = await Promise.all(userIdsArray.map(id => this.fetchUsername(id)));
        const lastUser = otherUsernames.pop(); // Remove the last user to handle the "and" separately
        if(includesCurrentUser) {
          return `You, ${otherUsernames.join(', ')} and ${lastUser}`;
        }
        else {
          return `${otherUsernames.join(', ')} and ${lastUser}`;
        }
    }
  }
  
  /**
   * Get the username of a user by their id.
   * @param userId 
   * @returns 
   */
  async fetchUsername(userId: string): Promise<string> {
    try {
      const response = await lastValueFrom(this.userService.getUsernameById(userId)) as { username: string };
      return response.username;
    } catch (error) {
      console.error(error);
      return 'Unknown';
    }
  }

}
