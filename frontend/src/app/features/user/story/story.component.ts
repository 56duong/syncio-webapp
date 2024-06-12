import { Component } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss']
}) 

export class StoryComponent {
  usersWithStories: User[] = [];

  constructor(
    private userService: UserService
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
}
