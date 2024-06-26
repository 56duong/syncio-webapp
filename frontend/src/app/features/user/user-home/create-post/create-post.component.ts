import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Visibility } from 'src/app/core/interfaces/Visibility';
import { Post } from 'src/app/core/interfaces/post';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PostService } from 'src/app/core/services/post.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
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
  currentUsername: any;
  displayModal: boolean = false;
  constructor(
    private postService: PostService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.currentUsername = this.tokenService.extractUsernameFromToken();
  }

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
    const post: Post = {
      caption: this.post.caption,
      createdDate: new Date().toISOString(),
      flag: true,
      createdBy: this.userService.getUserResponseFromLocalStorage()?.id,
      visibility: this.selectedVisibility,
    };
    if (!post.caption && this.selectedPhotoFile.length === 0) {
      this.toastService.showError('Error', 'A post must have either a caption or at least one image.');
      return; // Stop execution if validation fails
    }
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
    this.post.caption = this.post.caption
      ? this.post.caption + event.emoji.native
      : event.emoji.native;
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
