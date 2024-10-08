import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { CommentService } from 'src/app/core/services/comment.service';
import { LikeService } from 'src/app/core/services/like.service';
import { LoginDialogService } from 'src/app/core/services/login-dialog.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';

@Component({
  selector: 'app-like',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss'],
})

export class LikeComponent {
  @Input() postId!: string;
  @Input() createdBy!: string; // The id of the user who created the post
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() isOnPostDetails: boolean = false;
  likeCount: number = 0;
  commentCount: number = 0;
  userId: number = 0;
  isLiked: boolean = false;
  userResponse?: UserResponse | null =
    this.userService.getUserResponseFromLocalStorage();

  constructor(
    private likeService: LikeService,
    private commentService: CommentService,
    private userService: UserService,
    private notificationService: NotificationService,
    private redirectService: RedirectService,
    private loginDialogService: LoginDialogService,
  ) {}

  ngOnInit() {
    this.countLikes();
    this.countComments();
    if(this.userResponse?.id) {
      this.notificationService.connectWebSocket(this.userResponse?.id);
    }
  }

  ngOnDestroy() {
    if(this.userResponse?.id) this.notificationService.disconnect();
  }

  likePost() {
    //not logged in
    if(!this.userResponse?.id) {
      this.loginDialogService.show();
      return;
    }

    this.isLiked = !this.isLiked;
    this.likeCount = this.isLiked ? this.likeCount + 1 : this.likeCount - 1;

    this.likeService.toggleLikes(this.postId, this.userResponse?.id).subscribe({
      next: () => {
        // send notification
        if (this.createdBy != this.userResponse?.id && this.isLiked) {
          this.notificationService.sendNotification({
            targetId: this.postId,
            actorId: this.userResponse?.id,
            actionType: ActionEnum.LIKE_POST,
            redirectURL: `/post/${this.postId}`,
            recipientId: this.createdBy,
          });
        }
      },
      error: (error: any) => {
        this.isLiked = !this.isLiked;
        this.likeCount = this.isLiked ? this.likeCount - 1 : this.likeCount + 1;
        console.error('Error liking post:', error);
      },
    });
  }

  openDialog() {
    this.visibleChange.emit(true);
  }

  countLikes() {
    this.likeService.countLikes(this.postId).subscribe({
      next: (count) => {
        this.likeCount = count;

        if (
          this.userResponse &&
          (this.userResponse.id !== null || this.userResponse.id !== undefined)
        ) {
          this.likeService.hasLiked(this.postId).subscribe({
            next: (liked: boolean) => {
              this.isLiked = liked;
            },
            error: (error: any) => {
              console.error('Error checking if post is liked:', error);
            },
          });
        }
      },
      error: (error) => {
        console.error('Error checking if post is liked:', error);
      },
    });
  }

  countComments() {
    this.commentService.countComments(this.postId).subscribe({
      next: (count) => {
        this.commentCount = count;
      },
      error: (error) => {
        console.error('Error counting comments:', error);
      },
    });
  }
}
