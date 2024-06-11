import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Comment } from 'src/app/core/interfaces/comment';
import { Post } from 'src/app/core/interfaces/post';
import { CommentLikeService } from 'src/app/core/services/comment-like.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})

export class PostDetailComponent {
  @Input() post: Post = {}; // Current post
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter(); // Event emitter to close the dialog.
  isEmojiPickerVisible: boolean = false;
  comments: Comment[] = []; // List of parent comments
  comment: Comment = {}; // Current comment to post
  plainComment: string = ''; // Plain text comment
  showReplies: {
    [id: string]: { // The comment id
      visible: boolean;
      data: Comment[]; // list of replies
    };
  } = {}; // The replies for a comment (key is the comment id)
  subscriptionComments: Subscription = new Subscription(); // Subscription to the comments observable
  currentUserId: string = '';
  commentLikes: { 
    [id: string]: boolean;
  } = {}; // The likes for a comment (key is the comment id)

  constructor(
    private commentLikeService: CommentLikeService,
    private commentService: CommentService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUserId = this.tokenService.extractUserIdFromToken();

    // If user is logged in, connect to the WebSocket and get the comments observable.
    if (this.post.id && this.currentUserId) {
      this.commentService.connectWebSocket(this.post.id);
      this.getCommentsObservable();
    }

    this.getComments();
    
    setTimeout(() => {
      this.post.photos = this.post.photos;
    }, 0);
  }

  ngOnDestroy() {
    if(this.post.id) this.commentService.disconnect();
    this.subscriptionComments.unsubscribe();
  }

  /**
   * Subscribe to the comments observable to get the Comment object in real-time.
   */
  getCommentsObservable() {
    this.subscriptionComments = this.commentService.getCommentsObservable().subscribe({
      next: (comment) => {
        this.comments.unshift({ ...comment, createdDate: 'Just now' });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  closeDialog() {
    this.visibleChange.emit(false);
  }



  /* --------------------------- TEXT INPUT SECTION --------------------------- */

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

  addEmoji(event: any) {
    this.comment.text = `${this.comment.text || ''}${event.emoji.native}`;
    // Update the plain comment with the emoji.
    this.plainComment = event.emoji.native;
  }

  /**
   * Prepares a reply to a comment.
   * @param {string} commentId - The ID of the comment being replied to.
   */
  onReply(commentId: string) {
    this.comment.text = '@Reply&nbsp;';
    this.comment.parentCommentId = commentId;
  }



  /* ---------------------------- GET DATA SECTION ---------------------------- */

  /**
   * Get comments for the post. The comment is a parent comment if the parentCommentId is null.
   */
  getComments() {
    if (!this.post.id) return;

    this.commentService.getParentComments(this.post.id).subscribe({
      next: (comments) => {
        this.comments = comments;
        // Initialize the comment likes and check if the user has liked the comment.
        this.comments.forEach((comment) => {
          if(!comment.id || !this.currentUserId) return;
          this.commentLikes[comment.id] = this.hasCommentLiked(comment.id);
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  /**
   * View replies for a comment. If replies have not been fetched yet, fetch them.
   * @param commentId - The comment id.
   */
  viewReplies(commentId: string) {
    if (this.showReplies[commentId]) {
      // Toggle visibility of replies
      this.showReplies[commentId].visible = !this.showReplies[commentId].visible;
    } 
    else {
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
          
          this.showReplies[commentId].data.forEach((comment) => {
            if(!comment.id || !this.currentUserId) return;
            this.commentLikes[comment.id] = this.hasCommentLiked(comment.id);
          });
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  /**
   * Check if the current user has liked a comment.
   * @param commentId
   */
  hasCommentLiked(commentId: string) {
    if(this.currentUserId == null) return false;

    // Check if the comment has been initialized.
    if(this.commentLikes[commentId]) {
      return this.commentLikes[commentId];
    }

    // If the comment has not been initialized, fetch the like status.
    this.commentLikeService.hasCommentLiked(commentId).subscribe({
      next: (data) => {
        this.commentLikes[commentId] = data;
        return data;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
    return false;
  }
  


  /* ---------------------------- POST DATA SECTION --------------------------- */

  /**
   * Like a comment.
   * @param comment - The comment object to like or unlike.
   */
  likeComment(comment: Comment) {
    
    if(!comment.id || this.currentUserId == null) return;

    this.commentLikeService.toggleLikeComment(comment.id).subscribe({
      next: () => {
        if(!comment.id) return;
        // Toggle the like status.
        this.commentLikes[comment.id] = !this.commentLikes[comment.id];
        // Update the likes count.
        if(comment.likesCount != undefined) {
          comment.likesCount += this.commentLikes[comment.id] ? 1 : -1;
        }
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  postComment() {
    // Not logged in
    if(this.currentUserId == null) {
      console.log('User is not logged in');
      this.router.navigate(['/login'], { 
        queryParams: { message: 'Please login to comment' } 
      });
      return;
    }

    if (!this.post.id) return;

    // Empty comment
    if (!this.plainComment.trim()) return;

    this.comment = {
      ...this.comment,
      text: this.comment.text
        ?.replaceAll('<p><br></p>', '')
        .replace('@Reply&nbsp;', ''),
      postId: this.post.id,
      userId: this.currentUserId,
      likesCount: 0,
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
            createdDate: 'Just now',
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
