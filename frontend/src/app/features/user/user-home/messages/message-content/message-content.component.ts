import { Component, ElementRef, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { ContextMenu } from 'primeng/contextmenu';
import { Subscription } from 'rxjs';
import { MessageContent, MessageContentTypeEnum } from 'src/app/core/interfaces/message-content';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { Sticker } from 'src/app/core/interfaces/sticker';
import { User } from 'src/app/core/interfaces/user';
import { MessageContentService } from 'src/app/core/services/message-content.service';

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.scss']
})

export class MessageContentComponent {
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

  constructor(
    private messageContentService: MessageContentService,
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
  sendMessage(type: 'TEXT' | 'STICKER' | 'IMAGE') {
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
      type: type === 'TEXT' 
              ? MessageContentTypeEnum.TEXT 
              : type === 'STICKER' 
                ? MessageContentTypeEnum.STICKER 
                : MessageContentTypeEnum.IMAGE,
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
    this.replyingTo = messageContent;
    this.contextMenu.show(event);
  }


  /* -------------------------- IMAGE/STICKER SECTION ------------------------- */

  /**
   * When receiving a sticker from the sticker picker, send the sticker.
   */
  sendSticker(sticker: Sticker) {
    this.messageContent.message = sticker.imageUrl;
    this.sendMessage('STICKER');
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
        this.sendMessage('IMAGE');
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.imageUploader.clear();
  }

}
