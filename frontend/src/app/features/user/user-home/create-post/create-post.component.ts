import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
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
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  showDialog() {
    this.display = true;
  }

  onCancel() {
    this.display = false;
  }

  // create a post
  createPost() {
    const formData = new FormData();

    formData.append(
      'post',
      new Blob(
        [
          JSON.stringify({
            caption: this.post.caption,
            createdDate: new Date().toISOString(),
            flag: true,
            createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
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
    const post: Post = {
      caption: this.post.caption,
      photos: this.selectedPhotos,
      createdDate: new Date().toISOString(),
      flag: true,
      createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
    };
    this.postService.createPost(formData).subscribe({
      next: (response: any) => {
        post.id = response.body;

        this.postService.setNewPostCreated(post);
      },
      error: (error) => {
        console.error(error);
      },
    });

    this.post = {}; // Reset the post object
    this.selectedPhotos = []; // Clear selected photos display
    this.selectedPhotos = [];
    this.display = false;
  }

  onPhotoSelected(event: any) {
    this.selectedPhotoFile = Array.from(event.files);
    this.selectedPhotos = [];

    for (let file of this.selectedPhotoFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedPhotos = [...this.selectedPhotos, e.target.result];

        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
    this.fileUploader.clear();
  }
  // show the emoji picker (icon)
  addEmoji(event: any) {
    this.post.caption += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }
}
