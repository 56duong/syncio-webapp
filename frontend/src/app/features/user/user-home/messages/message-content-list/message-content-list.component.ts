import { Component, ElementRef, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { MessageContent, MessageContentTypeEnum } from 'src/app/core/interfaces/message-content';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { Sticker } from 'src/app/core/interfaces/sticker';
import { User } from 'src/app/core/interfaces/user';
import { MessageContentService } from 'src/app/core/services/message-content.service';
import { MessageRoomMemberService } from 'src/app/core/services/message-room-member.service';
import { MessageRoomService } from 'src/app/core/services/message-room.service';

@Component({
  selector: 'app-message-content-list',
  templateUrl: './message-content-list.component.html',
  styleUrls: ['./message-content-list.component.scss']
})

export class MessageContentListComponent {
  @Input() messageRoom: MessageRoom = {}; // current message room
  @Input() currentUser!: User; // Current user logged in.
  @Output() sendMessageEvent = new EventEmitter<void>();
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

  isShowDetails: boolean = false; // Indicates if the message room details are shown

  constructor(
    private messageContentService: MessageContentService,
    private messageRoomMemberService: MessageRoomMemberService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['messageRoom'] && this.messageRoom.id) {
      // get old messageRoom value and disconnect from the old message room
      let messageRoom: SimpleChange = changes['messageRoom'];

      // Disconnect
      if(messageRoom.previousValue && messageRoom.previousValue.id) {
        this.messageContentService.disconnect();
      }
      this.subscriptionMessageContents.unsubscribe();
      
      // New connect
      this.messageContentService.connectWebSocket(this.messageRoom.id);
      this.getMessageContentsObservable();
      this.getMessageContent();
      this.getMessageRoomMembers();

      this.isShowDetails = false;
    }
  }

  ngOnDestroy() {
    if (this.messageRoom.id) this.messageContentService.disconnect();
    this.subscriptionMessageContents.unsubscribe();
  }

  /**
   * Scroll to the bottom of the message container.
   */
  scrollToBottom(): void {
    this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
  }

  /**
   * Subscribe to the comments observable to get the Comment object in real-time.
   */
  getMessageContentsObservable() {
    this.subscriptionMessageContents = this.messageContentService.getMessageContentsObservable().subscribe({
      next: (messageContent) => {
        this.messageContents.push(messageContent);
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
   * Get the message content by room id.
   * @returns array of message contents.
   */
  getMessageContent() {
    if(!this.messageRoom.id) return;
    this.messageContentService.getMessageContentByRoomId(this.messageRoom.id).subscribe({
      next: (messageContents) => {
        this.messageContents = messageContents;
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

    this.messageContentService.sendMessageContent(this.messageContent);
    this.messageContent = {};

    // If this is the first message, emit the event to the parent component
    if(this.messageContents.length === 0) {
      this.sendMessageEvent.emit(); // Emit the event to the parent component
    }
    
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
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

  showDetails() {
    this.isShowDetails = !this.isShowDetails;
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

}
