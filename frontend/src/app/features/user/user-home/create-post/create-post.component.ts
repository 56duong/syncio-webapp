import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Visibility } from 'src/app/core/interfaces/Visibility';
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
  displayModal: boolean = false;
  constructor(
    private postService: PostService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  visibilityOptions = Visibility;
  selectedVisibility: Visibility = Visibility.PUBLIC;
  getVisibilityLabel(visibility: Visibility): string {
    switch (visibility) {
      case Visibility.PUBLIC:
        return 'Public';
      case Visibility.PRIVATE:
        return 'Private';
      case Visibility.FRIENDS:
        return 'Friends';
      case Visibility.CLOSE_FRIENDS:
        return 'Close Friends';
      default:
        return 'Set Visibility'; // Label mặc định
    }
  }
  showDialog() {
    this.display = true;
  }

  onCancel() {
    this.display = false;
  }

  // create a post
  createPost() {
    const formData = new FormData();

    const post: Post = {
      caption: this.post.caption,
      createdDate: new Date().toISOString(),
      flag: true,
      createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
      visibility: this.selectedVisibility,
    };
    formData.append(
      'post',
      new Blob([JSON.stringify(post)], {
        type: 'application/json',
      })
    );

    this.selectedPhotoFile.forEach((photo: File, index) => {
      formData.append(`images`, photo);
    });

    post.photos = this.selectedPhotos;

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

  // show modal select privacy
  onShowModalPublic() {
    this.displayModal = true;
    this.onCancel();
  }

  onBack() {
    this.displayModal = false;
    this.showDialog();
  }

  setVisibility(visibility: Visibility): void {
    this.selectedVisibility = visibility;
  }
  saveVisibility() {
    this.displayModal = false;
    this.showDialog();
  }
}
