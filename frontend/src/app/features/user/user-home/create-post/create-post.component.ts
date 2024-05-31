import { Component, ViewChild } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
  @ViewChild('fileUploader') fileUploader: any;
  display!: boolean;
  title: string = '' as string;
  post: Post = {};
  selectedPhotos: string[] = [];
  selectedPhotoFile: File[] = [];
  isEmojiPickerVisible: boolean = false;

  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}

  showDialog() {
    this.display = true;
  }

  onCancel() {
    this.display = false;
  }

  // create a post
  createPost() {
    if (!this.selectedPhotoFile || this.selectedPhotoFile.length === 0) {
      alert('Please select at least one image');
      return;
    }
    const formData = new FormData();

    formData.append(
      'post',
      new Blob(
        [
          JSON.stringify({
            caption: this.post.caption,
            createdDate: new Date().toISOString(),
            flag: true,
            // createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
            createdBy: "28cee30a-c3d7-4c78-b77a-6d7c4eafbba7",
          }),
        ],
        {
          type: 'application/json',
        }
      )
    );

    this.selectedPhotoFile.forEach((photo: File, index) => {
      formData.append(`images`, photo);
    });

    this.postService.createPost(formData).subscribe({
      next: (response: any) => {
        const post: Post = {
          id: response,
          caption: this.post.caption,
          photos: this.selectedPhotos,
          createdDate: new Date().toISOString(),
          flag: true,
          // createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
          createdBy: "28cee30a-c3d7-4c78-b77a-6d7c4eafbba7",
        };
        this.postService.setNewPostCreated(post);

      },
      error: (error) => {
        console.log(error);
      },
    });

    this.post = {}; // Reset the post object
    this.selectedPhotos = []; // Clear selected photos display
    this.selectedPhotos = [];
    this.display = false;
  }

  onPhotoSelected(event: any) {
    this.selectedPhotoFile = Array.from(event.files); // PrimeNG provides the files directly in the `files` property on the event.

    this.selectedPhotos = []; // Reset or initialize the array to hold the base64 strings of the images.
    for (let file of this.selectedPhotoFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedPhotos.push(e.target.result); // Push the base64 string to `selectedPhotos` to display in the template.
      };
      reader.readAsDataURL(file); // Start the file reading process to convert to base64.
    }
  }
  // show the emoji picker (icon)
  addEmoji(event: any) {
    this.post.caption += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }
}
