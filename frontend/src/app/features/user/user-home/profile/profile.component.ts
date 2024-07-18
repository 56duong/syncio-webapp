import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { Post } from 'src/app/core/interfaces/post';
import { User } from 'src/app/core/interfaces/user';
import { NotificationService } from 'src/app/core/services/notification.service';

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
  public settingIcon: string =
    'M46.7 20.6l-2.1-1.1c-.4-.2-.7-.5-.8-1-.5-1.6-1.1-3.2-1.9-4.7-.2-.4-.3-.8-.1-1.2l.8-2.3c.2-.5 0-1.1-.4-1.5l-2.9-2.9c-.4-.4-1-.5-1.5-.4l-2.3.8c-.4.1-.8.1-1.2-.1-1.4-.8-3-1.5-4.6-1.9-.4-.1-.8-.4-1-.8l-1.1-2.2c-.3-.5-.8-.8-1.3-.8h-4.1c-.6 0-1.1.3-1.3.8l-1.1 2.2c-.2.4-.5.7-1 .8-1.6.5-3.2 1.1-4.6 1.9-.4.2-.8.3-1.2.1l-2.3-.8c-.5-.2-1.1 0-1.5.4L5.9 8.8c-.4.4-.5 1-.4 1.5l.8 2.3c.1.4.1.8-.1 1.2-.8 1.5-1.5 3-1.9 4.7-.1.4-.4.8-.8 1l-2.1 1.1c-.5.3-.8.8-.8 1.3V26c0 .6.3 1.1.8 1.3l2.1 1.1c.4.2.7.5.8 1 .5 1.6 1.1 3.2 1.9 4.7.2.4.3.8.1 1.2l-.8 2.3c-.2.5 0 1.1.4 1.5L8.8 42c.4.4 1 .5 1.5.4l2.3-.8c.4-.1.8-.1 1.2.1 1.4.8 3 1.5 4.6 1.9.4.1.8.4 1 .8l1.1 2.2c.3.5.8.8 1.3.8h4.1c.6 0 1.1-.3 1.3-.8l1.1-2.2c.2-.4.5-.7 1-.8 1.6-.5 3.2-1.1 4.6-1.9.4-.2.8-.3 1.2-.1l2.3.8c.5.2 1.1 0 1.5-.4l2.9-2.9c.4-.4.5-1 .4-1.5l-.8-2.3c-.1-.4-.1-.8.1-1.2.8-1.5 1.5-3 1.9-4.7.1-.4.4-.8.8-1l2.1-1.1c.5-.3.8-.8.8-1.3v-4.1c.4-.5.1-1.1-.4-1.3zM24 41.5c-9.7 0-17.5-7.8-17.5-17.5S14.3 6.5 24 6.5 41.5 14.3 41.5 24 33.7 41.5 24 41.5z';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public userProfile: User = {
    id: '',
    username: '',
    followerCount: 0,
    followingCount: 0,
    avtURL: '',
    bio: '',
    posts: [],
  };
  public isFollowing?: boolean = false;
  public isCloseFriend?: boolean = false;
  userResponse?: UserResponse | null =
    this.userService.getUserResponseFromLocalStorage();
  public loginUser: string = this.userResponse?.id || '';

  post: Post = {};
  visible: boolean = false; // Used to show/hide the post detail modal

  // chooseLabel
  chooseLableDialog: boolean = false;
  userLabelInfos!: UserLabelInfo[];


  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private userLabelInfoService: UserLabelInfoService,
    private labelUpdateService: LabelUpdateService
  ) { }

  ngOnInit(): void {
    let id;
    this.route.params.subscribe((params) => {
      id = params['userId'];
      // this.checkFollowStatus(id);

      if (this.loginUser) {
        this.userService.getUserProfile2(id).subscribe({
          next: (response) => {
            this.userProfile = response;
            this.isFollowing = response.isFollowing;
          },
          error: (error) => {
            console.error('Error getting user profile', error);
          },
        });
        this.notificationService.connectWebSocket(this.loginUser);

      }
      else {
        this.loadUserProfile(id);
      }
    });
  }

  ngOnDestroy() {
    if (this.loginUser) this.notificationService.disconnect();
  }

  private loadUserProfile(userId: string): void {
    // this.checkFollowStatus(userId);
    this.userService.getUserProfile(userId).subscribe((response) => {
      this.userProfile.id = response.id;
      this.userProfile.username = response.username;
      this.userProfile.followerCount = response.followerCount;
      this.userProfile.followingCount = response.followingCount;
      this.userProfile.avtURL = response.avtURL;
      this.userProfile.bio = response.bio;
      this.userProfile.posts = response.posts;
      this.isFollowing = response.isFollowing;
      this.isCloseFriend = response.isCloseFriend;
    });
  }
  // private checkFollowStatus(targetId: string): void {
  //   if (this.loginUser !== targetId) {
  //     this.userService
  //       .isFollowing(this.loginUser, targetId)
  //       .subscribe((response: any) => {
  //         this.isFollowing = response;
  //       });
  //   }
  // }
  public handleEditProfile(): void {
    this.router.navigate(['/edit-profile']);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.avtURL = e.target.result; // Cập nhật URL của ảnh đại diện
      };
      reader.readAsDataURL(file);
      const fd = new FormData();
      fd.append('file', file);
      // this.userService.changeAvatar(fd).subscribe((response) => {
      //   console.log('response: ', response);
      // });
    }
  }

  public handleFollowUser(targetId: any): void {
    this.userService.followUser(targetId).subscribe({
      next: (response) => {
        this.isFollowing = true;
        if (this.userProfile && this.userProfile.followerCount !== undefined) {
          this.userProfile.followerCount += 1;

          // send notification to followed user
          this.notificationService.sendNotification({
            targetId: targetId,
            actorId: this.userResponse?.id,
            actionType: ActionEnum.FOLLOW,
            redirectURL: `/profile/${this.loginUser}`,
            recipientId: targetId,
          });
        }
      },
      error: (error) => {
        console.error('Error following user', error);
      },
    });
  }
  public handleUnFollowUser(targetId: any): void {
    this.userService.unfollowUser(targetId).subscribe({
      next: (response) => {
        this.isFollowing = false;
        if (this.userProfile && this.userProfile.followerCount !== undefined) {
          this.userProfile.followerCount -= 1;
        }
      },
      error: (error) => {
        console.error('Error following user', error);
      },
    });
  }

  public handleAddCloseFriends(targetId: any): void {
    this.userService.addCloseFriends(targetId).subscribe({
      next: (response: any) => {
        this.isCloseFriend = response;
      },
      error: (error: any) => {
        console.error('Error adding close friends', error);
      },
    });
  }

  public handleRemoveCloseFriends(targetId: any): void {
    this.userService.removeCloseFriends(targetId).subscribe({
      next: (response: any) => {
        this.isCloseFriend = false;
      },
      error: (error: any) => {
        console.error('Error removing close friends', error);
      },
    });
  }

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
