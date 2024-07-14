import { Component, ElementRef, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { MessageContent, MessageContentTypeEnum } from 'src/app/core/interfaces/message-content';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { Sticker } from 'src/app/core/interfaces/sticker';
import { User } from 'src/app/core/interfaces/user';
import { MessageContentService } from 'src/app/core/services/message-content.service';
import { MessageRoomMemberService } from 'src/app/core/services/message-room-member.service';

@Component({
  selector: 'app-message-content-list',
  templateUrl: './message-content-list.component.html',
  styleUrls: ['./message-content-list.component.scss']
})

export class MessageContentListComponent {
  @Input() messageRoom: MessageRoom = {}; // current message room
  @Input() currentUser!: User; // Current user logged in.
  @Output() sendFirstMessageEvent = new EventEmitter<void>();
  @Output() updateMessageRoomNameEvent = new EventEmitter<MessageRoom>();
  @Output() newMessageContentEvent = new EventEmitter<MessageContent>();
  @ViewChild('messageContentContainer') private messageContainer!: ElementRef;

  messageContents: MessageContent[] = []; // Array of message contents
  messageContent: MessageContent = {}; // Message content object to send
  isEmojiPickerVisible: boolean = false;
  plainComment: string = ''; // Plain text comment
  subscriptionMessageContents: Subscription = new Subscription(); // Subscription to the message contents observable
  
  // REPLY SECTION
  @ViewChild('contextMenu') contextMenu!: ContextMenu;
  replyingTo: MessageContent = {}; // Message content to reply to
  contextMenuItems: any[] = [
    {
      label: 'Reply',
      icon: 'pi pi-reply',
      command: () => {
        this.messageContent.replyTo = {...this.replyingTo};
      }
    }
  ]; // Context menu items when right-clicking on a message

  // IMAGE/STICKER SECTION
  @ViewChild('imageUploader') imageUploader: any; // Image uploader component use to upload and send images
  MessageContentTypeEnum = MessageContentTypeEnum;

  /** Indicates if the message room details are shown */
  isShowDetails: boolean = false;

  // UNSEEN MESSAGE SECTION
  /** The id of the last seen message */
  lastSeenMessageId: string = '';
  /** Indicates if the user has already scrolled to the unseen message section */
  alreadyScrolled: boolean = false;
  /** Intersection observer to watch the unseen message section */
  observer: IntersectionObserver | undefined;
  /** Reference to the end of the feed element. */
  @ViewChild('unseen') unseenElement: any;

  constructor(
    private messageContentService: MessageContentService,
    private messageRoomMemberService: MessageRoomMemberService,
  ) { }


  ngOnInit() {
    // Create an observer to watch the end of the feed element.
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // If the end of the feed element is intersecting, get more posts.
        if (entry.isIntersecting && !this.alreadyScrolled) {
          this.alreadyScrolled = true;
        }
      });
    });
  }
  

  async ngOnChanges(changes: SimpleChanges) {
    if(changes['messageRoom'] && this.messageRoom.id) {
      // New connect
      if(!this.messageContentService.getConnection(this.messageRoom.id)) {
        await this.messageContentService.connectWebSocket(this.messageRoom.id);
      }

      this.getMessageContentsObservable();
      this.getMessageContent();
      this.getMessageRoomMembers();

      this.isShowDetails = false;
      this.alreadyScrolled = false;

      // observe the unseen message section
      setTimeout(() => {
        const unseenElement = document.getElementById('unSeenMessage');
        if(unseenElement) this.observer?.observe(unseenElement);
      }, 100);
    }
  }


  ngOnDestroy() {
    if (this.messageRoom.id) this.messageContentService.disconnect(this.messageRoom.id);
    this.subscriptionMessageContents.unsubscribe();
  }


  /**
   * Get the message content by room id.
   * @returns array of message contents.
   */
  getMessageContent() {
    if(!this.messageRoom.id) return;
    this.messageContentService.getMessageContentByRoomId(this.messageRoom.id).subscribe({
      next: (messageContents) => {
        this.messageContents = messageContents;
        // Get the last seen message id
        this.messageContents.forEach((messageContent) => {
          if(!this.lastSeenMessageId && messageContent.dateSent && this.messageRoom.lastSeen) {
            if(messageContent.dateSent > this.messageRoom.lastSeen && messageContent.user?.id !== this.currentUser.id) {
              this.lastSeenMessageId = messageContent.id || '';
            }
          }
        });
        setTimeout(() => {
          this.scrollToBottom();
        }, 50);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * Get all the members in the message room.
   */
  getMessageRoomMembers() {
    if(!this.messageRoom.id) return;
    this.messageRoomMemberService.getMessageRoomMembersByRoomId(this.messageRoom.id).subscribe({
      next: (messageRoomMembers) => {
        this.messageRoom = {
          ...this.messageRoom,
          members: messageRoomMembers
        };
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * Subscribe to the message contents observable to get new message contents and append them to the message contents array.
   */
  getMessageContentsObservable() {
    if(!this.messageRoom.id) return;
    this.subscriptionMessageContents.unsubscribe();
    this.subscriptionMessageContents = this.messageContentService.getMessageContentsObservable(this.messageRoom.id).subscribe({
      next: (messageContent) => {
        if(Object.keys(messageContent).length > 0) {
          // append the new message content to the message contents array
          this.messageContents = [...this.messageContents, messageContent];
          setTimeout(() => {
            this.scrollToBottom();
          }, 50);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  
  addEmoji(event: any) {
    this.messageContent.message = `${this.messageContent.message || ''}${event.emoji.native}`;
    // Update the plain comment with the emoji.
    this.plainComment = event.emoji.native;
  }
  
  /**
   * Get the plain text comment to prevent empty comments and check if the comment is a reply.
   * 
   * @param event - The event object.
   */
  textChange(event: any) {
    // Set the plain comment to the text value.
    this.plainComment = event.textValue;
  }

  /**
   * Send a message.
   */
  sendMessage(type: MessageContentTypeEnum) {
    if(type === 'TEXT' && this.plainComment.trim() === '') return;

    let date = new Date();
    this.messageContent = {
      ...this.messageContent,
      user: {
        id: this.currentUser.id,
        username: this.currentUser.username,
      },
      messageRoomId: this.messageRoom.id,
      dateSent: new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString(),
      type: type,
    };

    // If this is the first message, emit the event to the parent component
    if(this.messageContents.length === 0) {
      this.sendFirstMessageEvent.emit(); // Emit the event to the parent component
    }

    this.messageContentService.sendMessageContent(this.messageContent);
    this.messageContent = {};
    
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
  }


  /**
   * The event receive from the message-room-detail component to update the message room name.
   * Emit to the message.component to update the message room name.
   * @param messageRoom 
   */
  updateMessageRoomName(messageRoom: MessageRoom) {
    this.updateMessageRoomNameEvent.emit(messageRoom);
  }


  /* ------------------------------ REPLY SECTION ----------------------------- */

  onContextMenu(event: any, messageContent: MessageContent) {
    if(messageContent.type?.startsWith('NOTIFICATION')) return; // Do not allow replying to notification messages
    this.replyingTo = messageContent;
    this.contextMenu.show(event);
  }


  /* -------------------------- IMAGE/STICKER SECTION ------------------------- */

  /**
   * When receiving a sticker from the sticker picker, send the sticker.
   */
  sendSticker(sticker: Sticker) {
    this.messageContent.message = sticker.imageUrl;
    this.sendMessage(MessageContentTypeEnum.STICKER);
  }

  /**
   * Upload photos and receive the image names and send the message with the image tags.
   * @param event The event object containing the selected photos.
   */
  sendPhotos(event: any) {
    const selectedPhotos = Array.from(event.files);

    const formData = new FormData();
    selectedPhotos.forEach((photo: any) => {
      formData.append(`photos`, photo);
    });

    this.messageContentService.uploadPhotos(formData).subscribe({
      next: (response) => {
        // output: ['image1.jpg','image2.jpg','image3.jpg', ...]
        this.messageContent.message = response.toString();
        this.sendMessage(MessageContentTypeEnum.IMAGE);
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.imageUploader.clear();
  }


  /**
   * Add a notification message to the message content.
   * @param type 
   * @param message 
   */
  addMessageContentNotification(type: MessageContentTypeEnum, message: string) {
    this.messageContent = {
      ...this.messageContent,
      message: message,
    };
    this.sendMessage(type);
  }


  /**
   * Show the message room details.
   */
  showDetails() {
    this.isShowDetails = !this.isShowDetails;
  }


  /**
   * Scroll to the bottom of the message container.
   */
  scrollToBottom(): void {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  
  /**
   * Scroll to the element with the given id.
   * @param id 
   */
  scrollToElement(id: string): void {
    const element = document.getElementById(id);
    element?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'start' 
    });
    this.alreadyScrolled = true;
  }

}
