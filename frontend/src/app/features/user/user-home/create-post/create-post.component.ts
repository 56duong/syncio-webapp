import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Post, Visibility } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
  @ViewChild('fileUploader') fileUploader: any; // photo upload
  isVisible!: boolean; // Used to show/hide the create post dialog
  post: Post = {}; // The post object to be created
  selectedPhotos: string[] = []; // The selected photos to be displayed
  selectedPhotoFile: File[] = []; // The selected photos file to be uploaded
  isEmojiPickerVisible: boolean = false; // Used to show/hide the emoji picker

  currentUsername: any;
  currentUserId: string = '' as string;

  isVisibleVisibility: boolean = false; // Used to show/hide the visibility modal

  isVisibleRecorder: boolean = false; // Used to show/hide the audio recorder dialog
  showPlayer: boolean = true; // Indicates if the audio player should be shown, used to force re-rendering
  @ViewChild('audioInput') audioInput!: ElementRef<any>; // input file for audio, use when click on upload audio
  selectedAudioFile: Blob | File | null = null; // The selected audio file to be uploaded
  audioItems = [
    {
      icon: 'pi pi-microphone',
      command: () => {
        this.isVisibleRecorder = true;
      },
    },
    {
      icon: 'pi pi-upload',
      command: () => {
        this.audioInput.nativeElement.click();
      },
    },
  ]; // The items for the audio menu

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUsername = this.tokenService.extractUsernameFromToken();
    this.currentUserId = this.tokenService.extractUserIdFromToken();
  }

  /**
   * This is called from the left menu component to show the create post dialog.
   */
  showDialog() {
    this.isVisible = true;
  }

  /**
   * Reset all the fields and close the create post dialog.
   */
  onCancel() {
    this.post = {}; // Reset the post object
    this.selectedPhotos = []; // Clear selected photos display
    this.selectedPhotoFile = [];
    this.selectedAudioFile = null;
    this.isVisible = false;
  }

  // create a post
  createPost() {
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }
    const formData = new FormData();
    const post: Post = {
      caption: this.post.caption,
      createdDate: new Date().toISOString(),
      flag: true,
      visibility: this.selectedVisibility,
    };

    //validate
    if (
      !post.caption &&
      this.selectedPhotoFile.length === 0 &&
      !this.selectedAudioFile
    ) {
      this.toastService.showError(
        'Error',
        'A post must have either a caption or at least one image or a audio.'
      );
      return; // Stop execution if validation fails
    }

    //add post to form data
    formData.append(
      'post',
      new Blob([JSON.stringify(post)], {
        type: 'application/json',
      })
    );

    // add photos to form data
    this.selectedPhotoFile.forEach((photo: File, index) => {
      formData.append(`images`, photo);
    });

    // add audio to form data
    if (this.selectedAudioFile) {
      formData.append(`audio`, this.selectedAudioFile);
    }

    this.postService.createPost(formData).subscribe({
      next: (response: any) => {
        post.id = response.body;
        post.createdBy = this.currentUserId;
        this.postService.setNewPostCreated(post);

        this.post = {}; // Reset the post object
        this.selectedPhotos = []; // Clear selected photos display
        this.selectedPhotoFile = [];
        this.selectedAudioFile = null;
        this.isVisible = false;
      },
      error: (error) => {
        console.error(error);
      },
    });
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

  /* ------------------------------- VISIBILITY ------------------------------- */

  visibilityOptions = Visibility;
  selectedVisibility: Visibility = Visibility.PUBLIC;

  getVisibilityLabel(visibility: Visibility): string {
    switch (visibility) {
      case Visibility.PUBLIC:
        return 'Everyone';
      case Visibility.PRIVATE:
        return 'Only me';
      case Visibility.CLOSE_FRIENDS:
        return 'Close Friends';
      default:
        return 'Set Visibility'; // Label mặc định
    }
  }

  /**
   * Show the visibility modal.
   */
  onShowModalVisibility() {
    this.isVisibleVisibility = true;
  }

  /**
   * Save the selected visibility and close the visibility modal.
   */
  saveVisibility() {
    this.isVisibleVisibility = false;
  }

  /* ---------------------------------- AUDIO --------------------------------- */

  /**
   * Handle the audio file selected event.
   * @param event
   */
  onAudioSelected(event: any) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList) {
      this.selectedAudioFile = fileList[0];
      this.post.audioURL = URL.createObjectURL(fileList[0]);
      // Force re-rendering of the audio player
      this.showPlayer = false;
      setTimeout(() => {
        this.showPlayer = true;
      }, 0);
    }
  }

  /**
   * Event emitted from the voice recorder dialog when the user submits the audio.
   * @param event The audio URL
   */
  async submitAudio(event: any) {
    if (!event) return;
    this.selectedAudioFile = await fetch(event).then((r) => r.blob());
    this.post.audioURL = event || '';
    // Force re-rendering of the audio player
    this.showPlayer = false;
    setTimeout(() => {
      this.showPlayer = true;
    }, 0);
    this.isVisibleRecorder = false;
  }
}
