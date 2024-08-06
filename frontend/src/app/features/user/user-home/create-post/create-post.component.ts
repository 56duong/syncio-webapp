import { Component, ViewChild, ChangeDetectorRef, ElementRef, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, switchMap } from 'rxjs';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { Post, Visibility } from 'src/app/core/interfaces/post';
import { UserSearch } from 'src/app/core/interfaces/user-search';
import { LoadingService } from 'src/app/core/services/loading.service';
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
  @Input() isMobile: boolean = false; // Flag to indicate if the device is mobile

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
      }
    },
    {
      icon: 'pi pi-upload',
      command: () => {
        this.audioInput.nativeElement.click();
      }
    }
  ]; // The items for the audio menu

  // Mention
  /** the config for the mention dropdown */
  mentionConfig: any;
  /** the list of users searched to show in the mention dropdown */
  userSearched: UserSearch[] = [];
  /** the list of users tagged in the post when mentionSelect is called */
  taggedUsers: UserSearch[] = []; // The tagged users in the caption
  
  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private translateService: TranslateService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.currentUsername = this.tokenService.extractUsernameFromToken();
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    this.updateMentionConfig();
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
    // Replace @username with @id in the post caption
    let modifiedText!: string;
    let taggedUserIds: string[] = [];

    if (this.post.caption) {
      ({ modifiedText, taggedUserIds } = this.replaceMentionWithId(this.post.caption));
    }

    const formData = new FormData();
    const post: Post = {
      caption: modifiedText,
      createdDate: new Date().toISOString(),
      flag: true,
      visibility: this.selectedVisibility,
    };

    //validate
    if (!post.caption && this.selectedPhotoFile.length === 0 && !this.selectedAudioFile) {
      this.toastService.showError(this.translateService.instant('error'), this.translateService.instant('aPostMustHaveAtLeastOneImageOrOneAudioOrCaption'));
      return; // Stop execution if validation fails
    }

    this.loadingService.show();

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
      next: (response) => {
        this.loadingService.hide();
        
        post.id = response.id;
        post.createdBy = this.currentUserId;

        // send notification to tagged users
        if(taggedUserIds.length > 0) {
          taggedUserIds.forEach((userId) => {
            this.notificationService.sendNotification({
              targetId: post.id,
              actorId: this.currentUserId,
              actionType: ActionEnum.POST_TAG,
              redirectURL: `/post/${post.id}`,
              recipientId: userId,
            });
          });
        }
        
        this.post = {}; // Reset the post object
        this.selectedPhotos = []; // Clear selected photos display
        this.selectedPhotoFile = [];
        this.selectedAudioFile = null;
        this.audioInput.nativeElement.value = ''; // Clear the audio input
        this.isVisible = false;
      },
      error: (error) => {
        this.loadingService.hide();
        this.toastService.showError(this.translateService.instant('error'), 'An error occurred while creating the post');
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
        return this.translateService.instant('public');
      case Visibility.PRIVATE:
        return this.translateService.instant('private');
      case Visibility.CLOSE_FRIENDS:
        return this.translateService.instant('closeFriends');
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
    if(!event) return;
    this.selectedAudioFile = await fetch(event).then((r) => r.blob());
    this.post.audioURL = event || '';
    // Force re-rendering of the audio player
    this.showPlayer = false;
      setTimeout(() => {
        this.showPlayer = true;
      }, 0);
    this.isVisibleRecorder = false;
  }
  

  /**
   * When caption changes, search for users to mention.
   * @param event 
   */
  onCaptionChange(event: any) {
    const value = event.target.value;
    if(event.data === '@') {
      // when start typing @
      this.userSearched = [];
      this.updateMentionConfig();
    }
    else {
      const mentionTerm = this.extractMentionTerm(value);
      if (mentionTerm) {
        this.userService.searchUsers(mentionTerm, mentionTerm).pipe(
          debounceTime(300), // Add a debounce to limit the number of API calls
          switchMap(users => {
            this.userSearched = users;
            this.updateMentionConfig();
            return [];
          })
        ).subscribe();
      }
    }
  }


  /**
   * Extract the mention term from the text.
   * Example: 'Hello @username' => 'username'
   * @param text 
   * @returns the mention term or null if not found. 
   */
  extractMentionTerm(text: string): string | null {
    const mentionMatch = text.match(/@(\w+)$/);
    return mentionMatch ? mentionMatch[1] : null;
  }


  /**
   * Update the mention config with the current list of users searched.
   */
  updateMentionConfig() {
    this.mentionConfig = {
      items: this.userSearched,
      triggerChar: '@',
      labelKey: 'username',
      mentionSelect: (item: UserSearch) => {
        this.taggedUsers.push(item); // Save the user ID
        return `@${item.username}`;
      }
    };
  }


  /**
   * Replace @username with @id in the post caption.
   * Example: 'Hello @username' => 'Hello @id'
   * Use: const { modifiedText, taggedUserIds } = this.replaceMentionWithId('Hello @username');
   * @param text 
   * @returns the modified text and the list of tagged user IDs.
   */
  replaceMentionWithId(text: string): { modifiedText: string, taggedUserIds: string[] } {
    const userMap = new Map(this.taggedUsers.map(user => [user.username, user.id]));
    const taggedUserIds: string[] = [];
  
    // Replace @username with @id in the post caption
    const modifiedText = text.replace(/@(\w+)/g, (match, username) => {
      const userId = userMap.get(username);
      if (userId) {
        taggedUserIds.push(userId);
        return `@${userId}`;
      }
      return match;
    });
  
    return { modifiedText, taggedUserIds };
  }

}
