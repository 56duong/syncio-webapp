import { Component, Input } from '@angular/core';
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

  currentDateTime: string = Date.now().toString();


  ngOnInit(): void {
    if (!this.height) this.height = this.width;
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
