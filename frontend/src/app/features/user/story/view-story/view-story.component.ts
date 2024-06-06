import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Story } from 'src/app/core/interfaces/story';
import { StoryService } from 'src/app/core/services/story.service';

@Component({
  selector: 'app-view-story',
  templateUrl: './view-story.component.html',
  styleUrls: ['./view-story.component.scss']
})

export class ViewStoryComponent {
  @Input() userIdInput: string = ''; // If userIdInput is true, the story view was opened from the FeedComponent. Otherwise, it was opened from a direct link.
  @Output() close = new EventEmitter<void>();
  stories: Story[] = [];

  constructor(
    private storyService: StoryService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    if(this.userIdInput) {
      // get stories by userId
      this.getStoriesByUserId(this.userIdInput);
    }
    else {
      // get stories by route param
      const userId = this.route.snapshot.paramMap.get('userId');
      if(userId) this.getStoriesByUserId(userId);
    }
  }

  getStoriesByUserId(userId: string) {
    this.storyService.getStoriesByUserId(userId).subscribe({
      next: (stories) => {
        this.stories = stories;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  closeViewStory() {
    if(this.userIdInput) {
      // Close from FeedComponent
      this.close.emit();
      this.location.replaceState('/');
    }
    else {
      // Close from direct link
      this.router.navigate(['/']);
    }
  }
}



/**
 * The closeViewStory method in ViewStoryComponent handles two cases:
 * 
 *  1. Closing from the FeedComponent: If userIdInput is true, it emits a close event and replaces 
 *  the current state in the browser's history with the root URL ('/'). 
 *  This effectively closes the story view without reloading the FeedComponent.
 * 
 *  2. Closing from a direct link: If userIdInput is false, it navigates to the root URL ('/'). 
 *  This will cause the FeedComponent to load, which is the expected behavior 
 *  when the story view was opened from a direct link.
 */