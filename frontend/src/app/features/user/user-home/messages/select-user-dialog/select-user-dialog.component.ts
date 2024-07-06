import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-select-user-dialog',
  templateUrl: './select-user-dialog.component.html',
  styleUrls: ['./select-user-dialog.component.scss']
})

export class SelectUserDialogComponent {
  @Input() expectedUsers: string[] | undefined = [];
  @Input() isDialogVisible: boolean = false;
  @Input() dialogTitle: string = '';
  @Input() dialogDescription: string = '';
  @Input() dialogSubmitLabel: string = '';
  searchedUsers: User[] = [];
  selectedUsers: User[] = [];
  @Output() selectedUsersEvent: EventEmitter<User[]> = new EventEmitter<User[]>();
  @Output() visibleHide = new EventEmitter<boolean>();

  constructor(
    private userService: UserService
  ) { }

  /**
   * Search users by username or email.
   * @param event 
   */
  search(event: any) {
    const searchText = event.query;
    this.userService.searchUsers(searchText, searchText).subscribe({
      next: (users) => {
        users = users.filter(user => !this.expectedUsers?.includes(user.id || ''));
        this.searchedUsers = users;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  submit() {
    this.selectedUsersEvent.emit(this.selectedUsers);
    this.selectedUsers = [];
  }

  hide() {
    this.visibleHide.emit(false);
  }

}
