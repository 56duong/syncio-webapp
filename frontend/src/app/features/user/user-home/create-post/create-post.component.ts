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
    this.post = {}; // Reset the post object
    this.selectedPhotos = []; // Clear selected photos display
    this.selectedPhotoFile = [];
  }

  onCancel() {
    this.display = false;
  }

  // create a post
  createPost() {
    const formData = new FormData();
<<<<<<< HEAD
=======

    const post: Post = {
      caption: this.post.caption,
      createdDate: new Date().toISOString(),
      flag: true,
      createdBy: this.userService.getUserResponseFromLocalStorage()?.id
    };

>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63
    formData.append(
      'post',
      new Blob(
        [
<<<<<<< HEAD
          JSON.stringify({
            caption: this.post.caption,
            createdDate: new Date().toISOString(),
            flag: true,
            createdBy: '5f8dfe06-774f-484b-90cf-ceed1f705b70',
          }),
=======
          JSON.stringify(post),
>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63
        ],
        {
          type: 'application/json',
        }
      )
    );

    this.selectedPhotoFile.forEach((photo: File, index) => {
      formData.append(`images`, photo);
    });

    post.photos = this.selectedPhotos;
    
    this.postService.createPost(formData).subscribe({
<<<<<<< HEAD
      next: (id: string) => {
        const post: Post = {
          id: id,
          caption: this.post.caption,
          photos: this.selectedPhotos,
          createdDate: new Date().toISOString(),
          flag: true,
          createdBy: '5f8dfe06-774f-484b-90cf-ceed1f705b70',
          // createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
        };

=======
      next: (response: any) => {
        post.id = response.body;
>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63
        this.postService.setNewPostCreated(post);
      },
      error: (error) => {
        console.error(error);
      },
    });

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
