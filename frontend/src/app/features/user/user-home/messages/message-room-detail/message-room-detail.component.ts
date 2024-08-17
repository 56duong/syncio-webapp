import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageRoom } from 'src/app/core/interfaces/message-room';
import { MessageRoomMember } from 'src/app/core/interfaces/message-room-member';
import { User } from 'src/app/core/interfaces/user';
import { MessageRoomMemberService } from 'src/app/core/services/message-room-member.service';
import { MessageRoomService } from 'src/app/core/services/message-room.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { DialogItem } from 'src/app/shared/components/global-dialog/global-dialog.component';

@Component({
  selector: 'app-message-room-detail',
  templateUrl: './message-room-detail.component.html',
  styleUrls: ['./message-room-detail.component.scss']
})

export class MessageRoomDetailComponent {
  @Input() isMobile: boolean = false; // Flag to indicate if the device is mobile
  @Output() backToMessageContentListEvent = new EventEmitter<void>(); // Event emitter to close the message room

  @Input() messageRoom: MessageRoom = {}; // current message room
  @Input() currentUser!: User; // Current user logged in.

  @Output() updateMessageRoomNameEvent = new EventEmitter<string>();
  @Output() addPeopleEvent = new EventEmitter<string>();
  @Output() removeMemberEvent = new EventEmitter<string>();
  @Output() leaveChatEvent = new EventEmitter<string>();
  @Output() makeAdminEvent = new EventEmitter<string>();
  @Output() removeAdminEvent = new EventEmitter<string>();

  isVisibleAddPeople: boolean = false; // Indicates if the add people dialog is visible
  isVisibleChangeGroupName: boolean = false; // Indicates if the change group name dialog is visible
  newMessageRoomName: string = ''; // New group name to update

  isVisibleEditMember: boolean = false; // Indicates if the edit member dialog is visible
  selectedMember: MessageRoomMember = {}; // Selected member to add

  get memberUserIds(): any {
    return this.messageRoom?.members?.map(m => m.userId);
  } // list of user ids in the message room

  editMemberDialogItems: DialogItem[] = [];
  _editMemberDialogItems: DialogItem[] = [
    { 
      label: this.translateService.instant('message_room_detail.remove_from_group'),
      bold: 7,
      color: 'red', 
      action: () => this.removeMember(this.selectedMember)
    }
  ]; // Dialog items for the edit member dialog

  isVisibleLeaveChat: boolean = false; // Indicates if the leave chat dialog is visible
  leaveChatDialogItems: any = [
    { 
      label: this.translateService.instant('message_room_detail.leave_chat'),
      color: 'red', 
      bold: 7,
      action: () => this.leaveChat()
    },
    { 
      label: this.translateService.instant('common.cancel'),
      action: () => this.isVisibleLeaveChat = false
    }
  ]; // Dialog items for the leave chat dialog

  get isAdmin(): boolean {
    return this.messageRoom?.members?.find(m => m.userId === this.currentUser.id && m.admin) ? true : false;
  } // Check if the current user is admin of the message room

  constructor(
    private messageRoomService: MessageRoomService,
    private messageRoomMemberService: MessageRoomMemberService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private redirectService: RedirectService
  ) { }

  ngOnInit() {
    this.newMessageRoomName = this.messageRoom.name || '';
    this.updateEditMemberDialogItems();
  }

  updateEditMemberDialogItems() {
    var items: DialogItem[] = this._editMemberDialogItems;
    if(!this.selectedMember.admin) {
      items = [
        ...items,
        { 
          label: this.translateService.instant('message_room_detail.make_admin'),
          action: () => this.makeAdmin(this.selectedMember)
        }
      ];
    }
    else {
      items = [
        ...items,
        { 
          label: this.translateService.instant('message_room_detail.remove_admin'),
          action: () => this.removeAdmin(this.selectedMember)
        }
      ];
    }
    this.editMemberDialogItems = [
      ...items,
      { 
        label: this.translateService.instant('common.cancel'),
        action: () => this.isVisibleEditMember = false
      }
    ];
  }

  selectMemberToEdit(member: MessageRoomMember) {
    this.updateEditMemberDialogItems();
    this.isVisibleEditMember = true; 
    this.selectedMember = member;
  }

  updateGroupName() {
    if(!this.messageRoom.id || !this.newMessageRoomName) return;

    this.messageRoomService.updateMessageRoomName(this.messageRoom.id, this.newMessageRoomName).subscribe({
      next: (messageRoomName) => {
        this.messageRoom.name = messageRoomName['name'];
        this.isVisibleChangeGroupName = false;
        this.updateMessageRoomNameEvent.emit(this.messageRoom.name);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  addPeople(event : User[]) {
    const userIds = event.map(user => user.id).filter((id): id is string => id !== undefined);
    if (!this.messageRoom.id || userIds.length === 0) return;

    this.messageRoomMemberService.addMessageRoomMembers(this.messageRoom.id, userIds).subscribe({
      next: (messageRoomMembers) => {
        console.log(messageRoomMembers);
        this.messageRoom.members = [...(this.messageRoom.members || []), ...messageRoomMembers];
        this.addPeopleEvent.emit(userIds.join(', '));
        this.isVisibleAddPeople = false;
      },
      error: (error) => {
        console.log(error);
        this.toastService.showError(
          this.translateService.instant('common.error'),
          error.error.message
        )
      }
    });
    this.isVisibleAddPeople = true;
  }

  leaveChat() {
    //check if there is left any admin
    this.messageRoomMemberService.hasOtherAdmins(this.messageRoom.id || '').subscribe({
      next: (response) => {
        if(!response) {
          this.toastService.showError('Error', 'You are the only admin in this group. Please make someone else admin before leaving.');
        }
        else {
          // If there are other admins, leave the chat.
          this.messageRoomMemberService.leaveChat(this.messageRoom.id || '').subscribe({
            next: () => {
              this.messageRoom.members = this.messageRoom.members?.filter(m => m.userId !== this.currentUser.id);
              this.leaveChatEvent.emit(this.currentUser.id);
              this.redirectService.redirectAndReload('/messages');
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

  removeMember(member: MessageRoomMember) {
    if(!this.messageRoom.id || !member.userId) return;

    this.messageRoomMemberService.removeMessageRoomMember(this.messageRoom.id, member.userId).subscribe({
      next: () => {
        this.messageRoom.members = this.messageRoom.members?.filter(m => m.userId !== member.userId);
        this.removeMemberEvent.emit(member.userId);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  makeAdmin(member: MessageRoomMember) {
    if(!this.messageRoom.id || !member.userId) return;

    this.messageRoomMemberService.makeAdmin(this.messageRoom.id, member.userId).subscribe({
      next: () => {
        this.messageRoom.members = this.messageRoom.members?.map(m => {
          if(m.userId === member.userId) m.admin = true;
          return m;
        });
        this.makeAdminEvent.emit(member.userId);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  removeAdmin(member: MessageRoomMember) {
    if(!this.messageRoom.id || !member.userId) return;

    this.messageRoomMemberService.removeAdmin(this.messageRoom.id, member.userId).subscribe({
      next: () => {
        this.messageRoom.members = this.messageRoom.members?.map(m => {
          if(m.userId === member.userId) m.admin = false;
          return m;
        });
        this.removeAdminEvent.emit(member.userId);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }


  /**
   * When device is mobile, click on the back button to close the message room detail
   */
  backToMessageContentList() {
    this.backToMessageContentListEvent.emit();
  }

}
