import { Component } from '@angular/core';
import { User } from 'src/app/core/interfaces/user';
import { StoryService } from 'src/app/core/services/story.service';

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss']
}) 

export class StoryComponent {
  usersWithStories: User[] = [];

  constructor(
    private storyService: StoryService,
  ) { }

  ngOnInit() {
    this.getUsersWithStories();
  }

  getUsersWithStories() {
    this.storyService.getUsersWithStories().subscribe({
      next: (users) => {
        this.usersWithStories = users;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
