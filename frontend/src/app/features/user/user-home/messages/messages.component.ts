import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { User } from 'src/app/core/interfaces/user';
import { MessageRoomService } from 'src/app/core/services/message-room.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})

export class MessagesComponent {
  messageRooms: MessageRoom[] = []; // Array of message rooms to display in the sidebar.
  currentUser!: User; // Current user logged in.
  
  isDialogVisible: boolean = false;
  selectedUserMembers: string[] = []; // Array of selected user members to create a message room.
  searchedUsers: User[] = []; // Array of searched users.

  selectedMessageRoom!: MessageRoom; // Selected message room to display the messages content.
  
  constructor(
    private messageRoomService: MessageRoomService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) { }
  
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
  }

  getMessageRoomsByUserId(userId: string) {
    this.messageRoomService.getMessageRoomsByUserId(userId).subscribe({
      next: (messageRooms) => {
        this.messageRooms = messageRooms;
        // Get the selected message room from the URL in case of page refresh.
        const roomId = this.router.url.split('/')[3];
        if(roomId) {
          this.selectedMessageRoom = this.messageRooms.find(room => room.id === roomId) || {} as MessageRoom;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  selectMessageRoom(messageRoom: MessageRoom) {
    this.selectedMessageRoom = messageRoom;
  }

  /**
   * Search users by username or email.
   * @param event 
   */
  search(event: any) {
    const searchText = event.query;
    this.userService.searchUsers(searchText, searchText).subscribe({
      next: (users) => {
        this.searchedUsers = users;
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
   * Check and create a new message room with selected user members.
   */
  chat() {
    if(this.selectedUserMembers.length <= 0) return;
    
    // extract list of id inside selectedUserMembers: User here
    const userIds = this.selectedUserMembers.map((user: any) => user.id);
    userIds.push(this.currentUser.id);
    this.messageRoomService.findExactRoomWithMembers(userIds).subscribe({
      next: (existsMessageRoom) => {
        // check if the room already exists
        if(existsMessageRoom != null) {
          // if exists, navigate to the room
          this.isDialogVisible = false;
          this.navigateToMessageRoom(existsMessageRoom);
        }
        else {
          // if not exists, create a new room
          this.messageRoomService.createMessageRoomWithUsers(userIds).subscribe({
            next: (messageRoom) => {
              this.messageRooms = [messageRoom, ...this.messageRooms];
              this.isDialogVisible = false;
              this.navigateToMessageRoom(messageRoom);
            },
            error: (error) => {
              console.log(error);
            }
          });
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  /**
   * Send a message event from the message content component.
   * Check if the selected message room is not in the message rooms array, 
   * mean it's a new message room and is the first message content.
   */
  sendMessageEvent() {
    // check if this selected message room is not in the message rooms array
    if(!this.messageRooms.find(room => room.id === this.selectedMessageRoom.id)) {
      this.messageRooms = [this.selectedMessageRoom, ...this.messageRooms];
    }
  }

}
