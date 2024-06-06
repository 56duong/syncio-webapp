import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-story-list',
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss']
})

export class StoryListComponent {
  usersWithStories: User[] = [];
  selectedUser: User | null = null;

  constructor(
    private userService: UserService,
    private location: Location,
  ) { }

  ngOnInit() {
    this.getUsersWithStories();
  }

  getUsersWithStories() {
    this.userService.getUsersWithStories().subscribe({
      next: (users) => {
        this.usersWithStories = users;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  /**
   * Navigate to the story of the selected user and update the URL by replacing the current state
   * @param user 
   */
  navigateToStory(user: User) {
    this.selectedUser = user;
    this.location.replaceState(`/story/${user.id}`);
  }

  close() {
    this.selectedUser = null;
  }

}
