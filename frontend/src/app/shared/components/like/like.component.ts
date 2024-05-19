import { Component, Input } from '@angular/core';
import { CommentService } from 'src/app/core/services/comment.service';
import { LikeService } from 'src/app/core/services/like.service';

@Component({
  selector: 'app-like',
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss']
})

export class LikeComponent {
  @Input() postId!: string;
  likeCount: number = 0;
  commentCount: number = 0;

  constructor(
    private likeService: LikeService,
    private commentService: CommentService,
  ) {}

  ngOnInit() {
    this.countLikes();
    this.countComments();
  }

  countLikes() {
    this.likeService.countLikes(this.postId).subscribe({
      next: (count) => {
        this.likeCount = count;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  countComments() {
    this.commentService.countComments(this.postId).subscribe({
      next: (count) => {
        this.commentCount = count;
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
}
