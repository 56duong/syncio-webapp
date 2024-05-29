import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommentService } from 'src/app/core/services/comment.service';
import { LikeService } from 'src/app/core/services/like.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';

@Component({
  selector: 'app-like',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss'],
})
export class LikeComponent {
  @Input() postId!: string;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() isOnPostDetails: boolean = false;
  likeCount: number = 0;
  commentCount: number = 0;
  userId: number = 0;
  userResponse?: UserResponse | null;
  constructor(
    private likeService: LikeService,
    private commentService: CommentService,
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.countLikes();
    this.countComments();
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
  }
  likePost() {
    this.likeService.toggleLikes(this.postId, this.userResponse?.id).subscribe({
      next: () => {
        this.countLikes();
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  openDialog() {
    this.visibleChange.emit(true);
    console.log('this.postId');
  }

  countLikes() {
    this.likeService.countLikes(this.postId).subscribe({
      next: (count) => {
        this.likeCount = count;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  countComments() {
    this.commentService.countComments(this.postId).subscribe({
      next: (count) => {
        this.commentCount = count;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
