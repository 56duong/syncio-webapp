import { Component, ElementRef, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { MessageContent } from 'src/app/core/interfaces/message-content';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { MessageContentService } from 'src/app/core/services/message-content.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';

@Component({
  selector: 'app-message-content',
  templateUrl: './message-content.component.html',
  styleUrls: ['./message-content.component.scss']
})

export class MessageContentComponent {
  @Input() messageRoom: MessageRoom = {}; // current message room
  @Output() sendMessageEvent = new EventEmitter<void>();
  @ViewChild('messageContentContainer') private messageContainer!: ElementRef;
  messageContents: MessageContent[] = []; // Array of message contents
  messageContent: MessageContent = {}; // Message content object to send
  currentUser!: UserResponse;
  isEmojiPickerVisible: boolean = false;
  plainComment: string = ''; // Plain text comment
  subscriptionMessageContents: Subscription = new Subscription(); // Subscription to the message contents observable


  constructor(
    private messageContentService: MessageContentService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getUserResponseFromLocalStorage() as UserResponse ?? {};
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['messageRoom'] && this.messageRoom.id) {
      // get old messageRoom value and disconnect from the old message room
      let messageRoom: SimpleChange = changes['messageRoom'];

      // Disconnect
      if(messageRoom.previousValue && messageRoom.previousValue.id) {
        this.messageContentService.disconnect(messageRoom.previousValue.id);
      }
      this.subscriptionMessageContents.unsubscribe();
      
      // New connect
      this.messageContentService.connectWebSocket(this.messageRoom.id);
      this.getMessageContentsObservable();
      this.getMessageContent();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy() {
    if (this.messageRoom.id) this.messageContentService.disconnect(this.messageRoom.id);
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
  sendMessage() {
    if(this.plainComment.trim() === '') return;

    this.messageContent = {
      ...this.messageContent,
      user: {
        id: this.currentUser.id,
        username: this.currentUser.username,
      },
      messageRoomId: this.messageRoom.id,
      dateSent: new Date().toISOString()
    };

    this.messageContentService.sendMessageContent(this.messageContent);
    this.messageContent = {};

    // If this is the first message, emit the event to the parent component
    if(this.messageContents.length === 0) {
      this.sendMessageEvent.emit(); // Emit the event to the parent component
    }
  }
}
