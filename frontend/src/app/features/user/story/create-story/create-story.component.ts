import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { LoadingService } from 'src/app/core/services/loading.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { StoryService } from 'src/app/core/services/story.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.scss']
})

export class CreateStoryComponent {
  isEmojiPickerVisible: boolean = false;
  backgroundColor: string = '#000000'; // background color of the story

  objectList: any[] = [{
    "type": "text", // type of object, can be "text" or "image
    "id": this.generateId(),
    "text": "Hello World",
    "style": {
      "font-family": "Arial",
      "color": "#ffffff",
      "background-color": "",
      "font-size": "13px",
      "font-weight": "700",
      "font-style": "normal",
      "text-decoration": "none",
      "position": "absolute",
    }
  }]; // list of text objects inside the story
  selectedObject: any = null; // selected text object

  activeIndexTabView: number = 0; // active index of the tab view

  constructor(
    private storyService: StoryService,
    private router: Router,
    private toastService: ToastService,
    private elementRef: ElementRef,
    private loadingService: LoadingService,
    private redirectService: RedirectService
  ) { }

  ngOnInit() {
    this.selectedObject = this.objectList[0];
  }

  /**
   * Reset the selected object to a new text object
   * @param event when the function is called from #story, mean click outside the text or image object, will reset the selected object 
   * @returns 
   */
  resetSelectedObject(event?: any) {
    //check if click on itself not child
    if(event && event.target !== event.currentTarget) return;

    this.activeIndexTabView = 0;
    this.selectedObject = {
      "type": "text", // type of object, can be "text" or "image
      "id": this.generateId(),
      "text": "Hello World",
      "style": {
        "font-family": "Arial",
        "color": "#ffffff",
        "background-color": "",
        "font-size": "13px",
        "font-weight": "700",
        "font-style": "normal",
        "text-decoration": "none",
        "position": "absolute",
      }
    };
  }

  /**
   * On selecting an object emit from the app-resizable-draggable-component
   * @param event true if an object is selected, false if an object is deselected 
   * @param object the selected object
   */
  isSelected(event: any, object: any) {
    if(event) {
      this.selectedObject = object;
    }
    else {
      if(this.selectedObject && this.selectedObject.type === 'text') return;
      this.resetSelectedObject();
    }
  }

  /**
   * On selecting an image from the file upload component
   * @param event 
   * @param imageUpload 
   */
  onSelectImageUpload(event: any, imageUpload: any) {
    this.objectList = [...this.objectList, {
      type: 'image',
      id: this.generateId(),
      url: event.currentFiles[0].objectURL.changingThisBreaksApplicationSecurity,
      style: {
        'filter': 'none',
        'border-radius': '0px',
        'transform': 'rotate(0deg)',
      }
    }];

    // reset the file upload component
    imageUpload.clear();
  }

  /**
   * Delete the selected object
   */
  deleteSelectedObject() {
    this.objectList = this.objectList.filter(object => object.id !== this.selectedObject.id);
    this.resetSelectedObject();
  }

  addEmoji(event: any) {
    this.selectedObject.text += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }

  /**
   * Add text to the story
   */
  addText() {
    // prevent reference to the same object
    const newObject = JSON.parse(JSON.stringify(this.selectedObject));
    newObject.id = this.generateId();

    this.objectList = [
      ...this.objectList, 
      newObject
    ];

    this.selectedObject = newObject;
  }

  /**
   * Share the story by converting the story into an image and uploading it to the server
   */
  async share() {
    this.loadingService.show();

    this.selectedObject = null;

    // wait for the selectedObject to be set to null
    await new Promise(f => setTimeout(f, 0));

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
            this.loadingService.hide();
            this.toastService.showSuccess('Success', 'Story created successfully');
            setTimeout(() => {
              this.redirectService.redirectAndReload('/');
            }, 2000);
          },
          error: (error) => {
            console.error(error);
            this.toastService.showError('Error', error.error.message);
          }
        });
      })
    });
  }

  /**
   * Generate a random id
   * @returns a random id string of length 7
   */
  generateId() {
    return Math.random().toString(36).slice(2, 9);
  }

  /**
   * Cancel the story creation and navigate back to the home page
   */
  cancel() {
    this.router.navigate(['/']);
  }

}
