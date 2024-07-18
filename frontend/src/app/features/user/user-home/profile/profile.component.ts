import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { Post } from 'src/app/core/interfaces/post';
import { UserProfile } from 'src/app/core/interfaces/user-profile';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PostService } from 'src/app/core/services/post.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserCloseFriendService } from 'src/app/core/services/user-close-friend.service';
import { UserFollowService } from 'src/app/core/services/user-follow.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { UserLabelInfoService } from 'src/app/core/services/user-label-info.service';
import { LabelService } from 'src/app/core/services/label.service';
import { UserLabelInfo } from 'src/app/core/interfaces/user-label-info';
import { LabelUpdateService } from 'src/app/core/services/label-update.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})

export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public userProfile: UserProfile = {
    id: '',
    username: '',
    followerCount: 0,
    followingCount: 0,
    bio: '',
    posts: [],
    isFollowing: false,
    isCloseFriend: false
  };

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
      label: 'Add to Close Friends',
      action: () => this.toggleCloseFriend(this.userProfile.id)
    },
    { 
      label: 'Unfollow',
      action: () => this.toggleFollow(this.userProfile.id)
    },
    { 
      label: 'Cancel',
      action: () => this.dialogVisible = false
    }
  ]; // unfollow dialog items

  isVisibleFollowers: boolean = false; // show/hide the followers modal
  isVisibleFollowing: boolean = false; // show/hide the following modal

  // chooseLabel
  chooseLableDialog: boolean = false;
  userLabelInfos!: UserLabelInfo[];

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private tokenService: TokenService,
    private postService: PostService,
    private userFollowService: UserFollowService,
    private userCloseFriendService: UserCloseFriendService,
    private toastService: ToastService,
    private userLabelInfoService: UserLabelInfoService,
    private labelUpdateService: LabelUpdateService

  ) {}

  ngOnInit(): void {
    this.notificationService.connectWebSocket(this.currentUserId);

    // subscribe to route params to get user id
    this.route.params.subscribe((params) => {
      this.profileId = params['userId'];
      this.getUserProfile();
      this.getPosts();
    });
  }

  
  getUserProfile() {
    if(this.currentUserId) {
      // if user is logged in, use getUserProfile2 to get with token
      this.userService.getUserProfile2(this.profileId).subscribe({
        next: (response) => {
          this.userProfile = {...this.userProfile, ...response}
          this.dialogItems[0].label = response.isCloseFriend ? 'Remove from Close Friends' : 'Add to Close Friends';
        },
        error: (error) => {
          console.error('Error getting user profile', error);
        },
      });
    }
    else {
      // if user is not logged in, use getUserProfile to get without token
      this.userService.getUserProfile(this.profileId).subscribe((response) => {
        this.userProfile = {...this.userProfile, ...response}
        this.dialogItems[0].label = response.isCloseFriend ? 'Remove from Close Friends' : 'Add to Close Friends';
      });
    }
  }


  getPosts() {
    if(this.currentUserId) {
      this.postService.getPostsByUserId(this.profileId).subscribe({
        next: (response) => {
          this.userProfile.posts = response;
        },
        error: (error) => {
          console.error('Error getting user posts', error);
        }
      });
    }
    else {
      this.postService.getPostsByUserId2(this.profileId).subscribe({
        next: (response) => {
          this.userProfile.posts = response;
        },
        error: (error) => {
          console.error('Error getting user posts', error);
        }
      });
    }
  }

  public handleEditProfile(): void {
    this.router.navigate(['/edit-profile']);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      let newAvatarFileNames = this.currentUserId + '.jpg';
      // Append and rename the file with user id
      const fd = new FormData();
      fd.append('file', new File([file], newAvatarFileNames, {
        type: file.type,
        lastModified: file.lastModified,
      }));

      this.userService.changeAvatar(fd).subscribe({
        next: () => {
          this.toastService.showSuccess('Success', 'Avatar changed successfully');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: (error) => {
          console.error('Error changing avatar', error);
        }
      });
    }
  }


  /**
   * Toggle follow/unfollow user.
   * If action is follow, send notification to followed user.
   * @param targetId the user id to follow/unfollow
   */
  toggleFollow(targetId: string | undefined) {
    if(!targetId) return;
    this.userFollowService.toggleFollow(targetId).subscribe({
      next: (response) => {
        this.userProfile.isFollowing = response;
        // update follower count
        this.userProfile.followerCount += response ? 1 : -1;
        // if action is follow, send notification to followed user
        if(response) {
          this.notificationService.sendNotification({
            targetId: targetId,
            actorId: this.currentUserId,
            actionType: ActionEnum.FOLLOW,
            redirectURL: `/profile/${this.currentUserId}`,
            recipientId: targetId,
          });
        }
        else {
          // if action is unfollow, also remove close friend
          if(this.userProfile.isCloseFriend) {
            this.userCloseFriendService.removeCloseFriend(targetId).subscribe({
              next: (response) => {
                this.userProfile.isCloseFriend = !response;
                this.dialogItems[0].label = response ? 'Add to Close Friends' : 'Remove from Close Friends';
              },
              error: (error) => {
                console.error('Error removing close friends', error);
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Error following user', error);
      }
    });
  }

  

  /**
   * Toggle close friend.
   * @param targetId the user id to add/remove from close friends
   */
  toggleCloseFriend(targetId: string | undefined) {
    if(!targetId) return;
    this.userCloseFriendService.toggleCloseFriend(targetId).subscribe({
      next: (response) => {
        this.userProfile.isCloseFriend = response;
        this.dialogItems[0].label = response ? 'Remove from Close Friends' : 'Add to Close Friends';
      },
      error: (error) => {
        console.error('Error toggling close friends', error);
      }
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
      this.userLabelInfoService.getLabelsByUserId(this.userProfile.id).subscribe({
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
    const userLabelInfoWithShow = this.userLabelInfos.find(i => i.isShow === true);

    if (userLabelInfoWithShow) {
      curLabelId = userLabelInfoWithShow?.labelId ?? '';
    }

    const newLabelId = userLabelInfo.labelId;

    this.userLabelInfoService.update_isShow(userId, curLabelId, newLabelId).subscribe({
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
}
