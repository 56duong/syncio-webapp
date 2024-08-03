import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { Post } from 'src/app/core/interfaces/post';
import { UserProfile } from 'src/app/core/interfaces/user-profile';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserCloseFriendService } from 'src/app/core/services/user-close-friend.service';
import { UserFollowService } from 'src/app/core/services/user-follow.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserLabelInfoService } from 'src/app/core/services/user-label-info.service';
import { UserLabelInfo } from 'src/app/core/interfaces/user-label-info';
import { LabelUpdateService } from 'src/app/core/services/label-update.service';
import { UserStory } from 'src/app/core/interfaces/user-story';
import { StoryService } from 'src/app/core/services/story.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  isMobile: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public userProfile: UserProfile = {
    id: '',
    username: '',
    followerCount: 0,
    followingCount: 0,
    bio: '',
    posts: [],
    isFollowing: false,
    isCloseFriend: false,
  };

  qrCodeDialogVisible: boolean = false; // show/hide the QR code dialog
  qrCodeUrl: string = ''; // URL of the QR code image

  profileId: string = ''; // user id from route params

  currentUserId: string = this.tokenService.extractUserIdFromToken(); // current logged in user

  get isOwnerProfile(): boolean {
    return this.currentUserId === this.userProfile.id;
  } // check if current user is owner of the profile

  post: Post = {}; // use to open post detail modal
  visible: boolean = false; // show/hide the post detail modal

  dialogVisible: boolean = false; // show/hide the unfollow dialog
  dialogItems: any = [
    {
      label: this.translateService.instant('addToCloseFriends'),
      action: () => this.toggleCloseFriend(this.userProfile.id),
    },
    {
      label: this.translateService.instant('unfollow'),
      action: () => this.toggleFollow(this.userProfile.id),
    },
    {
      label: this.translateService.instant('cancel'),
      action: () => (this.dialogVisible = false),
    },
    {
      label: 'Qr Code',
      action: () => this.showQrCode(),
    },
  ]; // unfollow dialog items

  isVisibleFollowers: boolean = false; // show/hide the followers modal
  isVisibleFollowing: boolean = false; // show/hide the following modal

  // chooseLabel
  chooseLableDialog: boolean = false;
  userLabelInfos!: UserLabelInfo[];

  userStory: UserStory | undefined;

  isVisibleChooseViewMode: boolean = false; // show/hide the choose view mode dialog
  viewMode: 'grid' | 'list' = 'grid'; // view mode of the posts
  sortMode: 'newest' | 'oldest' = 'newest'; // sort mode of the posts
  viewOptions = [
    { id: 'grid', label: this.translateService.instant('grid'), icon: 'pi pi-table' },
    { id: 'list', label: this.translateService.instant('list'), icon: 'pi pi-bars' }
  ];
  sortOptions = [
    { id: 'desc', label: this.translateService.instant('newest'), value: 'newest', icon: 'pi pi-arrow-up' },
    { id: 'asc', label: this.translateService.instant('oldest'), value: 'list', icon: 'pi pi-arrow-down' }
  ];

  selectedTab: number = 0;

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tokenService: TokenService,
    private userFollowService: UserFollowService,
    private userCloseFriendService: UserCloseFriendService,
    private toastService: ToastService,
    private userLabelInfoService: UserLabelInfoService,
    private labelUpdateService: LabelUpdateService,
    private storyService: StoryService,
    private redirectService: RedirectService,
    private translateService: TranslateService
  ) {
    this.isMobile = window.innerWidth < 768;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    this.notificationService.connectWebSocket(this.currentUserId);

    // subscribe to route params to get user id
    this.route.params.subscribe(async (params) => {
      let user = params['userId']; // user may be username or user id
      //check if the profileId is a username
      if(user.indexOf('-') === -1) {
        const { userId } = await lastValueFrom(this.userService.getUserIdByUsername(user));
        this.profileId = userId;
      }
      else {
        this.profileId = user;
      }
      this.getUserStory();
      this.getUserProfile();
    });
  }

  getUserStory() {
    if (this.currentUserId) {
      this.storyService.getUserStory(this.profileId).subscribe({
        next: (response) => {
          this.userStory = response;
        },
        error: (error) => {
          console.error('Error getting user story', error);
        },
      });
    }
  }

  getUserProfile() {
    this.userService.getUserProfile(this.profileId).subscribe((response) => {
      this.location.replaceState('/profile/' + response.username);
      this.userProfile = { ...this.userProfile, ...response };
      this.dialogItems[0].label = response.isCloseFriend
        ? this.translateService.instant('removeFromCloseFriends')
        : this.translateService.instant('addToCloseFriends');
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      let newAvatarFileNames = this.currentUserId + '.jpg';
      // Append and rename the file with user id
      const fd = new FormData();
      fd.append(
        'file',
        new File([file], newAvatarFileNames, {
          type: file.type,
          lastModified: file.lastModified,
        })
      );

      this.userService.changeAvatar(fd).subscribe({
        next: () => {
          this.toastService.showSuccess(
            this.translateService.instant('success'),
            this.translateService.instant('avatarUpdatedSuccessfully')
          );
          setTimeout(() => {
            this.redirectService.reloadPage();
          }, 1000);
        },
        error: (error) => {
          console.error('Error changing avatar', error);
        },
      });
    }
  }

  /**
   * Toggle follow/unfollow user.
   * If action is follow, send notification to followed user.
   * @param targetId the user id to follow/unfollow
   */
  toggleFollow(targetId: string | undefined) {
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }
    if (!targetId) return;
    this.userFollowService.toggleFollow(targetId).subscribe({
      next: (response) => {
        this.userProfile.isFollowing = response;
        // update follower count
        this.userProfile.followerCount += response ? 1 : -1;
        // if action is follow, send notification to followed user
        if (response) {
          this.notificationService.sendNotification({
            targetId: targetId,
            actorId: this.currentUserId,
            actionType: ActionEnum.FOLLOW,
            redirectURL: `/profile/${this.currentUserId}`,
            recipientId: targetId,
          });
        } else {
          // if action is unfollow, also remove close friend
          if (this.userProfile.isCloseFriend) {
            this.userCloseFriendService.removeCloseFriend(targetId).subscribe({
              next: (response) => {
                this.userProfile.isCloseFriend = !response;
                this.dialogItems[0].label = response
                  ? this.translateService.instant('addToCloseFriends')
                  : this.translateService.instant('removeFromCloseFriends');
              },
              error: (error) => {
                console.error('Error removing close friends', error);
              },
            });
          }
        }
      },
      error: (error) => {
        console.error('Error following user', error);
      },
    });
  }

  /**
   * Toggle close friend.
   * @param targetId the user id to add/remove from close friends
   */
  toggleCloseFriend(targetId: string | undefined) {
    if (!targetId) return;
    this.userCloseFriendService.toggleCloseFriend(targetId).subscribe({
      next: (response) => {
        this.userProfile.isCloseFriend = response;
        this.dialogItems[0].label = response
          ? this.translateService.instant('removeFromCloseFriends')
          : this.translateService.instant('addToCloseFriends');
      },
      error: (error) => {
        console.error('Error toggling close friends', error);
      },
    });
  }
  /**
   * Send follow notification to target user.
   * @param targetId
   */
  sendFollowNotification(targetId: string) {
    this.notificationService.sendNotification({
      targetId: targetId,
      actorId: this.currentUserId,
      actionType: ActionEnum.FOLLOW,
      redirectURL: `/profile/${this.currentUserId}`,
      recipientId: targetId,
    });
  }

  /**
   * Show post detail modal.
   * @param event
   */
  showPostDetail(event: any) {
    this.visible = event;
    this.location.replaceState('/post/' + this.post.id);
  }

  handleShowPostDetail(visible: any, post: Post) {
    this.post = post;
    this.visible = visible;
    this.location.replaceState('/post/' + this.post.id);
  }

  showChooseLabelDialog() {
    this.chooseLableDialog = true;
    if (this.userProfile.id) {
      this.userLabelInfoService
        .getLabelsByUserId(this.userProfile.id)
        .subscribe({
          next: (response) => {
            this.userLabelInfos = response;
          },
          error: (error) => {
            console.error('Error getting labels', error);
          },
        });
    }
  }

  confirm(userLabelInfo: any) {
    const userId = userLabelInfo.userId;
    let curLabelId = '';
    const userLabelInfoWithShow = this.userLabelInfos.find(
      (i) => i.isShow === true
    );

    if (userLabelInfoWithShow) {
      curLabelId = userLabelInfoWithShow?.labelId ?? '';
    }

    const newLabelId = userLabelInfo.labelId;

    this.userLabelInfoService
      .update_isShow(userId, curLabelId, newLabelId)
      .subscribe({
        next: (response) => {
          // response chứa URL mới
          this.labelUpdateService.updateGifUrl(response);
          this.chooseLableDialog = false;
        },
        error: (error) => {
          console.error('Error updating label info', error);
        },
      });
  }
  showQrCode() {
    const userId = this.userProfile.id;
    this.userService.getQrCodeFromUser(userId).subscribe({
      next: (response) => {
        this.qrCodeUrl = response;
        this.qrCodeDialogVisible = true;
      },
      error: (error) => {
        console.error('Error getting QR code', error);
      },
    });
  }

  
  selectTab(tab: number) {
    if(this.selectedTab === tab && tab === 0) {
      this.isVisibleChooseViewMode = true;
    }
    this.selectedTab = tab;
  }

}
