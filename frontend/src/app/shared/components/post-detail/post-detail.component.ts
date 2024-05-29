import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Comment } from 'src/app/core/interfaces/comment';
import { Post } from 'src/app/core/interfaces/post';
import { CommentService } from 'src/app/core/services/comment.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent {
  @Input() post: Post = {};
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter(); // Event emitter to close the dialog.
  isEmojiPickerVisible: boolean = false;
  comments: Comment[] = [];
  comment: Comment = {};
  plainComment: string = ''; // Plain text comment
  showReplies: {
    [id: string]: {
      visible: boolean;
      data: Comment[];
    };
  } = {}; // The replies for a comment (key is the comment id)


  constructor(
    private commentService: CommentService,
    private userService: UserService
  ) { }


  ngOnInit() {
    if (this.post.id) {
      this.commentService.connectWebSocket(this.post.id);
      this.getCommentsObservable();
    }

    this.getComments();
    console.log(this.post.photos);
    setTimeout(() => {
      this.post.photos = this.post.photos;
    }, 0);
  }

  ngOnDestroy() {
    if (this.post.id) this.commentService.disconnect(this.post.id);
  }

  /**
   * Subscribe to the comments observable to get the Comment object in real-time.
   */
  getCommentsObservable() {
    this.commentService.getCommentsObservable().subscribe({
      next: (comment) => {
        this.comments.unshift({ ...comment, createdDate: 'now' });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  /**
   * Get comments for the post. The comment is a parent comment if the parentCommentId is null.
   */
  getComments() {
    if (!this.post.id) return;

    this.commentService.getParentComments(this.post.id).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  closeDialog() {
    this.visibleChange.emit(false);
  }

  addEmoji(event: any) {
    this.comment.text = `${this.comment.text || ''}${event.emoji.native}`;
    // Update the plain comment with the emoji.
    this.plainComment = event.emoji.native;
  }

  onReply(commentId: string) {
    this.comment.text = '@Reply&nbsp;';
    this.comment.parentCommentId = commentId;
  }

  /**
   * View replies for a comment. If replies have not been fetched yet, fetch them.
   * @param commentId - The comment id.
   */
  viewReplies(commentId: string) {
    if (this.showReplies[commentId]) {
      // Toggle visibility of replies
      this.showReplies[commentId].visible =
        !this.showReplies[commentId].visible;
    } else {
      // Initialize the replies object
      this.showReplies[commentId] = {
        visible: true,
        data: [],
      };

      if (!this.post.id) return;

      // If replies have not been fetched yet, fetch them
      this.commentService.getReplies(this.post.id, commentId).subscribe({
        next: (replies) => {
          this.showReplies[commentId].data = replies;
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  /**
   * Get the plain text comment to prevent empty comments and check if the comment is a reply.
   *
   * @param event - The event object.
   */
  textChange(event: any) {
    // Set the plain comment to the text value.
    this.plainComment = event.textValue;

    // Check if the comment is a reply.
    this.comment.parentCommentId = this.comment.text?.includes('@Reply&nbsp;')
      ? this.comment.parentCommentId
      : undefined;
  }

  postComment() {
    if (!this.plainComment.trim()) return;

    if (!this.post.id) return;

    this.comment = {
      ...this.comment,
      text: this.comment.text
        ?.replaceAll('<p><br></p>', '')
        .replace('@Reply&nbsp;', ''),
      postId: this.post.id,

      userId: this.userService.getUserResponseFromLocalStorage()?.id

    };

    // If the comment is a parent comment, send the comment (realtime).
    if (!this.comment.parentCommentId) {
      this.commentService.sendComment(this.comment);
      this.comment = {};
    }
    // If the comment is a reply, send the reply (not realtime).
    else {
      this.commentService.postComment(this.comment).subscribe({
        next: (id) => {
          this.comment = {
            ...this.comment,
            id: id,
            createdDate: 'now',
          };

          if (this.comment.parentCommentId) {
            // Add the comment to the showReplies.data array.
            if (!this.showReplies[this.comment.parentCommentId]) {
              // Initialize the replies object
              this.showReplies[this.comment.parentCommentId] = {
                visible: true,
                data: [],
              };
            }

            // +1 the replies count for the parent comment.
            const parentComment = this.comments.find(
              (comment) => comment.id === this.comment.parentCommentId
            );
            if (parentComment) {
              parentComment.repliesCount = (this.comment.repliesCount ?? 0) + 1;
            }

            this.showReplies[this.comment.parentCommentId].data.unshift(
              this.comment
            );

            this.comment = {};
          }
        },
        error: (error: any) => {
          console.log(error);
        },
      });
    }
  }
}
