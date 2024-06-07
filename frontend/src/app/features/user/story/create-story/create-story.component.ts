import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { StoryService } from 'src/app/core/services/story.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.scss']
})

export class CreateStoryComponent {
  isEmojiPickerVisible: boolean = false;
  backgroundColor: string | number = '#000000';
  selectedText: any = {
    "text": "Hello World",
    "style": {
      "font-family": "Arial",
      "color": "#ffffff",
      "font-size": "13px",
      "font-weight": "bold",
      "font-style": "normal",
      "text-decoration": "none",
    }
  };
  textList: any[] = []; // list of text objects inside the story

  constructor(
    private storyService: StoryService,
    private router: Router,
    private toastService: ToastService,
    private elementRef: ElementRef,
  ) { }

  resetSelectedText() {
    this.selectedText = {
      "text": "Hello World",
      "style": {
        "font-family": "Arial",
        "color": "#ffffff",
        "font-size": "13px",
        "font-weight": "bold",
        "font-style": "normal",
        "text-decoration": "none",
      }
    };
  }

  addEmoji(event: any) {
    this.selectedText.text += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }

  /**
   * Add text to the story
   */
  addText() {
    this.textList = [...this.textList, this.selectedText];
    this.resetSelectedText();
    console.log(this.textList);
  }

  cancel() {
    this.router.navigate(['/']);
  }

  /**
   * Share the story by converting the story into an image and uploading it to the server
   */
  share() {
    const storyElement = this.elementRef.nativeElement.querySelector('.story');
    html2canvas(storyElement).then(canvas => {
      canvas.toBlob((blob) => {
        if(!blob) return;

        // if size of blob is greater than 10 MB then return
        if(blob.size > 10 * 1024 * 1024) {
          this.toastService.showError('Error', 'Image size should be less than 10MB');
          return;
        }

        // create a FormData object and append the blob to it
        const formData = new FormData();
        formData.append('photo', blob);
        // send the image to the server
        this.storyService.createStory(formData).subscribe({
          next: (response: any) => {
            console.log(response);
            this.toastService.showSuccess('Success', 'Story created successfully');
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error(error);
            this.toastService.showError('Error', error.error.message);
          }
        });
      })
    });
  }

}
