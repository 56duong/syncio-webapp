import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { UserStory } from 'src/app/core/interfaces/user-story';
import { ConstructImageUrlPipe } from 'src/app/core/pipes/construct-image-url.pipe';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})

export class AvatarComponent {
  /** The user id to get the avatar */
  @Input() userId: string | undefined;
  /** The width of the avatar in pixels */
  @Input() width: number | undefined;
  /** The height of the avatar in pixels, if not provided, it will be the same as the width */
  @Input() height: number | undefined;
  
  @Input() userStory: UserStory | undefined;
  
  innerWidth: number =0;
  innerHeight: number = 0;

  currentDateTime: string = Date.now().toString();


  ngOnInit() {
    if (!this.height) this.height = this.width;
    if(this.width && !this.userStory) {
      this.innerWidth = this.width;
      this.innerHeight = this.width;
    }
  }


  ngOnChanges(changes: any) {
    if (changes.userStory && changes.userStory.currentValue) {
      if(this.width) {
        if(this.userStory) {
          this.innerWidth = this.width - 8;
          this.innerHeight = this.width - 8;
        }
      }
    }
  }


  getAvatarURL(): string {
    const constructImageUrlPipe = new ConstructImageUrlPipe(); // Manually create an instance
    let baseUrl = 'users/' + this.userId + '.jpg'; // Construct the base URL
    // Use the pipe to transform the URL
    let fullUrl = constructImageUrlPipe.transform(baseUrl);
    // Check if the URL already contains a query parameter
    if (fullUrl.includes('?')) {
      fullUrl += '&';
    } else {
      fullUrl += '?';
    }
    // Append the current date
    fullUrl += this.currentDateTime;
    return fullUrl;
  }

}
