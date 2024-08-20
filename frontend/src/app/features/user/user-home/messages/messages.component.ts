import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageContent, MessageContentTypeEnum } from 'src/app/core/interfaces/message-content';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { User } from 'src/app/core/interfaces/user';
import { UserSearch } from 'src/app/core/interfaces/user-search';
import { LoadingService } from 'src/app/core/services/loading.service';
import { MessageContentService } from 'src/app/core/services/message-content.service';
import { MessageRoomMemberService } from 'src/app/core/services/message-room-member.service';
import { MessageRoomService } from 'src/app/core/services/message-room.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserSettingService } from 'src/app/core/services/user-setting.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})

export class MessagesComponent {
  isMobile: boolean = false;
  @ViewChild('messageContainer') messageContainerElement: any;

  messageRooms: MessageRoom[] = []; // Array of message rooms to display in the sidebar.
  currentUser!: User; // Current user logged in.
  
  isDialogVisible: boolean = false;
  selectedUserMembers: UserSearch[] = []; // Array of selected user members to create a message room.

  selectedMessageRoom!: MessageRoom; // Selected message room to display the messages content.
  
  MessageContentTypeEnum = MessageContentTypeEnum;

  subscriptionMessageContentsMap: Map<string, any> = new Map(); // Map of subscriptions to the message contents observable
  
  constructor(
    private messageRoomService: MessageRoomService,
    private tokenService: TokenService,
    private router: Router,
    private messageRoomMemberService: MessageRoomMemberService,
    private messageContentService: MessageContentService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private userSettingService: UserSettingService,
    private loadingService: LoadingService
  ) { 
    this.isMobile = window.innerWidth < 768;
  }
  

  ngOnInit() {
    this.tokenService.getCurrentUserFromToken().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.getMessageRoomsByUserId(user.id);
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.messageRoomService.connectWebSocketNewMessageGroup();
    this.getNewMessageGroupObservable();

    this.messageRoomService.connectWebSocketFirstMessage();
    this.getMessageRoomsFirstMessageObservable();
  }


  ngOnDestroy() {
    this.subscriptionMessageContentsMap.forEach((subscription) => {
      subscription.unsubscribe();
      this.messageContentService.disconnect(subscription.messageRoomId);
    });
    this.messageRoomService.disconnect();
  }


  /**
   * Receive new message content and update the last message and unSeenCount of the message room.
   * @param messageContent 
   * @returns 
   */
  receiveNewMessageContent(messageContent: MessageContent) {
    if(Object.keys(messageContent).length <= 0) return;
    // Find the index of the message room in the message rooms array
    const roomIndex = this.messageRooms.findIndex(room => room.id === messageContent.messageRoomId);
    if (roomIndex !== -1) {
      // Update the last message and unSeenCount of the message room
      let room = this.messageRooms[roomIndex];
      if(messageContent.user?.id === this.currentUser.id || (this.selectedMessageRoom && messageContent.messageRoomId === this.selectedMessageRoom.id)) {
        room = {...room, lastMessage: messageContent};
      }
      else {
        room = {...room, lastMessage: messageContent, unSeenCount: room.unSeenCount ? room.unSeenCount + 1 : 1};
      }
      // Remove the room from its current position
      this.messageRooms.splice(roomIndex, 1);
      // Unshift the room to the beginning of the array
      this.messageRooms.unshift(room);
    }
  }


  /**
   * When a new message room is created.
   * This is used if the room is group chat.
   * It will add the new message room to the message rooms array, connect and subscribe to the message room.
   */
  getNewMessageGroupObservable() {
    this.messageRoomService.getNewMessageGroupObservable().subscribe({
      next: (messageRoom) => {
        if(!messageRoom.id) return; 
        if(messageRoom.createdBy !== this.currentUser.id) {
          // when a new message room is created, add it to the message rooms array
          this.messageRooms = [messageRoom, ...this.messageRooms];
        }
        // Connect to the new message room
        this.connectAndSubscribeToMessageRoom(messageRoom.id);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * When receiving the first message content of a new message room.
   * This is used if the room is a direct message between two users.
   * You can use this method as an alternative to getNewMessageGroupObservable() for direct messages.
   * It will add the new message room to the message rooms array, connect and subscribe to the message room.
   */
  getMessageRoomsFirstMessageObservable() {
    this.messageRoomService.getMessageRoomsFirstMessageObservable().subscribe({
      next: (messageRoom) => {
        if(!messageRoom.id) return;
        if(messageRoom.createdBy != this.currentUser.id) {
          if(!messageRoom.group) {
            messageRoom.avatarURL = messageRoom.createdBy; // update avatar is the created by user id
            this.messageRooms = [messageRoom, ...this.messageRooms];
          }
        }
        this.connectAndSubscribeToMessageRoom(messageRoom.id);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * Get all message rooms by user id.
   * @param userId 
   */
  getMessageRoomsByUserId(userId: string) {
    this.messageRoomService.getMessageRoomsByUserId(userId).subscribe({
      next: (messageRooms) => {
        this.messageRooms = messageRooms;
        this.connectAndSubscribeToMessageRooms();
        // Get the selected message room from the URL in case of page refresh.
        const roomId = this.router.url.split('/')[3];
        if(roomId) {
          // Find the message room by the room id
          let messageRoom = this.messageRooms.find(room => room.id === roomId) || {} as MessageRoom;
          // If the message room is found, select the message room
          if(Object.keys(messageRoom).length > 0) {
            this.selectMessageRoom(messageRoom);
          }
          else {
            // If the message room is not found, get the message room by the room id
            // this case happens when the room is created but there is no message content yet.
            this.messageRoomService.getMessageRoomById(roomId).subscribe({
              next: (room) => {
                if(room.id) {
                  this.userSettingService.checkWhoCanSendYouNewMessage(room.id).subscribe({
                    next: (result) => {
                      if(result) {
                        this.selectMessageRoom(room);
                      }
                      else {
                        this.router.navigate(['/messages']);
                      }
                    },
                    error: (error) => {
                      console.log(error);
                    }
                  });
                }
              },
              error: (error) => {
                console.log(error);
                if(error.status === 404) {
                  this.router.navigate(['/not-found']);
                }
              }
            });
          }
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * Connect to the WebSocket server and subscribe to all message rooms.
   */
  async connectAndSubscribeToMessageRooms() {
    for (const room of this.messageRooms) {
      if (!room.id) continue; // Use continue instead of return
      try {
        this.connectAndSubscribeToMessageRoom(room.id);
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
      }
    }
  }


  /**
   * Connect to the WebSocket server and subscribe to the specified message room.
   * @param messageRoomId 
   * @returns 
   */
  async connectAndSubscribeToMessageRoom(messageRoomId: string) {
    // if the message room is already subscribed, return
    if(this.subscriptionMessageContentsMap.has(messageRoomId)) return;
    // Connect to the WebSocket server
    await this.messageContentService.connectWebSocket(messageRoomId);
    // Subscribe to the message contents observable
    const subscription = this.messageContentService.getMessageContentsObservable(messageRoomId).subscribe({
      next: (messageContent) => {
        this.receiveNewMessageContent(messageContent);
      },
      error: (error) => {
        console.log(error);
      }
    });
    // Add the subscription to the map
    this.subscriptionMessageContentsMap.set(messageRoomId, subscription);
  }


  /**
   * When user selects a message room, update the last seen message and set the selected message room.
   * @param messageRoom 
   * @returns 
   */
  selectMessageRoom(messageRoom: MessageRoom) {
    if(messageRoom.id === this.selectedMessageRoom?.id) return;
    
    this.updateLastSeenMessage(this.selectedMessageRoom);

    this.selectedMessageRoom = {...messageRoom};
    // Reset the unSeenCount to 0 when the message room is selected.
    const index = this.messageRooms.findIndex(room => room.id === this.selectedMessageRoom.id);
    if(index !== -1) {
      this.messageRooms[index].unSeenCount = 0;
    }
    
    this.updateLastSeenMessage(messageRoom);

    if(this.isMobile) {
      this.scrollToBehavior('right');
    }
  }


  /**
   * Update the last seen message of the message room.
   * @param messageRoom 
   * @returns 
   */
  updateLastSeenMessage(messageRoom: MessageRoom) {
    if(!messageRoom || !messageRoom.id) return;
    this.messageRoomMemberService.updateLastSeenMessage(messageRoom.id).subscribe({
      next: (result) => {
        this.messageRooms = this.messageRooms.map((room: MessageRoom) => {
          if(room.id === messageRoom.id) {
            room = {...room, lastSeen: result};
          }
          return room;
        });
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * Check and create a new message room with selected user members.
   */
  chat(event: UserSearch[]) {
    this.selectedUserMembers = event;

    if(this.selectedUserMembers.length <= 0) return;

    this.loadingService.show();
    
    // extract list of id inside selectedUserMembers: User here
    const userIds = this.selectedUserMembers.map((user: any) => user.id);
    userIds.unshift(this.currentUser.id);
    
    this.messageRoomService.findExactRoomWithMembers(userIds).subscribe({
      next: (existsMessageRoom) => {
        // check if the room already exists
        if(existsMessageRoom != null) {
          // if exists, navigate to the room
          this.isDialogVisible = false;
          this.navigateToMessageRoom(existsMessageRoom);
          this.selectedUserMembers = [];
          this.loadingService.hide();
        }
        else {
          // if not exists, create a new room
          this.messageRoomService.createMessageRoomWithUsers(userIds).subscribe({
            next: (messageRoom) => {
              // update the avatarURL of the message room if the room is a direct message between two users
              if(userIds.length === 2) messageRoom.avatarURL = userIds.filter((id: string) => id !== this.currentUser.id)[0];
              this.messageRooms = [messageRoom, ...this.messageRooms];
              this.selectMessageRoom(messageRoom);
              this.isDialogVisible = false;
              this.navigateToMessageRoom(messageRoom);
              this.selectedUserMembers = [];
              this.loadingService.hide();
            },
            error: (error) => {
              console.log(error);
              this.loadingService.hide();
              this.toastService.showError(
                this.translateService.instant('common.error'),
                error.error.message
              )
            }
          });
        }
      },
      error: (error) => {
        console.log(error);
        this.loadingService.hide();
      }
    });
  }


  /**
   * Send a message event from the message content component.
   * Check if the selected message room is not in the message rooms array, 
   * mean it's a new message room and is the first message content.
   */
  sendFirstMessageEvent() {
    if(!this.selectedMessageRoom.id) return;
    this.messageRoomMemberService.getMessageRoomMembersByRoomId(this.selectedMessageRoom.id).subscribe({
      next: (members) => {
        this.selectedMessageRoom.members = members;
        let receiveId = this.selectedMessageRoom.members?.filter((member: any) => member.userId != this.currentUser.id)[0].userId;
        if(!receiveId || !this.selectedMessageRoom.id) return;
        this.messageRoomService.sendFirstMessage(receiveId, this.selectedMessageRoom.id).subscribe({
          next: (result) => {
            // console.log(result);
          },
          error: (error) => {
            console.log(error);
          }
        });
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * Navigate to the message room and set the selected message room.
   * @param messageRoom - The message room to navigate to. 
   */
  navigateToMessageRoom(messageRoom: MessageRoom) {
    this.router.navigate(['/messages/inbox', messageRoom.id]);
    this.selectedMessageRoom = messageRoom;
  }


  /**
   * Receive from the message-content-list component to update the message room name.
   * @param messageRoom 
   */
  updateMessageRoomName(messageRoom: MessageRoom) {
    this.messageRooms = this.messageRooms.map(room => {
      if(room.id === messageRoom.id) {
        return messageRoom;
      }
      return room;
    });
  }


  backToMessageRoomListEvent(event: any) {
    this.scrollToBehavior('left');
    this.selectedMessageRoom = {} as MessageRoom;
    this.router.navigate(['/messages']);
  }


  scrollToBehavior(direction: 'left' | 'right') {
    if(direction === 'left') {
      this.messageContainerElement.nativeElement.scrollLeft -= this.messageContainerElement.nativeElement.scrollWidth;
    }
    else {
      this.messageContainerElement.nativeElement.scrollLeft += this.messageContainerElement.nativeElement.scrollWidth;
    }
  }

}
