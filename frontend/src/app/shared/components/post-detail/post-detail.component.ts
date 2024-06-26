import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Comment } from 'src/app/core/interfaces/comment';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { Post } from 'src/app/core/interfaces/post';
import { CommentLikeService } from 'src/app/core/services/comment-like.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PostService } from 'src/app/core/services/post.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { TextUtils } from 'src/app/core/utils/text-utils';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})

export class PostDetailComponent {
  @Input() post: Post = {}; // Current post
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter(); // Event emitter to close the dialog.
  
  isDirectPost: boolean = false; // Check if the user is viewing the post directly.

  currentUserId: string = ''; // The id of the current logged-in user
  isEmojiPickerVisible: boolean = false;
  plainComment: string = ''; // Plain text comment
  
  comments: Comment[] = []; // List of parent comments
  comment: Comment = {}; // Current comment to post
  showReplies: {
    [id: string]: { // The comment id
      visible: boolean;
      data: Comment[]; // list of replies
    };
  } = {}; // The replies for a comment (key is the comment id)
  subscriptionComments: Subscription = new Subscription(); // Subscription to the comments observable
  
  commentLikes: { 
    [id: string]: boolean;
  } = {}; // The likes for a comment by logged in user (key is the comment id)

  ownerParentCommentId: string = ''; // The id of the owner of the parent comment. Use to send notification to the owner of the parent comment.

  reportVisible: boolean = false; // Used to show/hide the report modal
  dialogVisible: boolean = false;
  dialogItems: any = [
    { 
      label: 'Report',
      color: 'red', 
      action: () => this.reportVisible = true
    },
    { 
      label: 'Copy link',
      action: () => this.copyLink()
    },
    { 
      label: 'Cancel',
      action: () => this.dialogVisible = false
    }
  ];

  constructor(
    private postService: PostService,
    private commentLikeService: CommentLikeService,
    private commentService: CommentService,
    private notificationService: NotificationService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private textUtils: TextUtils,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.currentUserId = this.tokenService.extractUserIdFromToken();

    // Get the post id from the route if it is not set. Mean the user is viewing the post directly.
    if(!this.post.id) {
      this.isDirectPost = true;
      this.visible = true;

      // Subscribe to the route params to get the post id.
      this.route.params.subscribe(params => {
        this.post.id = params['id'];

        if(this.post.id) {
          // Get the post from database
          this.postService.getPostById(this.post.id).subscribe({
            next: (post) => {
              this.post = { ...post};
              this.post.photos = this.post.photos;
              
              // If user is logged in, connect to the WebSocket and get the comments observable.
              if (this.post.id && this.currentUserId) {
                if(this.post.id) this.commentService.disconnect();
                this.subscriptionComments.unsubscribe();

                this.commentService.connectWebSocket(this.post.id);
                this.getCommentsObservable();
              }

              this.getComments();
              
            },
            error: (error) => {
              console.log(error);
            },
          });
        }
      });
    }
    else {
      // If the post id is set, the user is viewing the post from the feed.
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

    // If user is logged in, connect to the WebSocket for notifications.
    if(this.currentUserId) {
      this.notificationService.connectWebSocket(this.currentUserId);
    }
    
  }

  ngOnDestroy() {
    if(this.post.id) this.commentService.disconnect();
    this.subscriptionComments.unsubscribe();
    if(this.currentUserId) this.notificationService.disconnect();
  }

  /**
   * Subscribe to the comments observable to get the Comment object in real-time.
   */
  getCommentsObservable() {
    this.subscriptionComments = this.commentService.getCommentsObservable().subscribe({
      next: (comment) => {
        this.comments.unshift({ ...comment, createdDate: 'Just now' });
        // send notification to owner of the post
        if (this.post.createdBy != this.currentUserId) {
          this.notificationService.sendNotification({
            targetId: this.post.id,
            actorId: this.currentUserId,
            actionType: ActionEnum.COMMENT_POST,
            redirectURL: `/post/${this.post.id}`,
            recipientId: this.post.createdBy,
          });
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  closeDialog() {
    this.visibleChange.emit(false);
    this.location.replaceState('/');
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

    if(!this.comment.parentCommentId) {
      this.ownerParentCommentId = '';
    }
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
  onReply(commentId: string, ownerParentCommentId: string) {
    this.comment.text = '@Reply&nbsp;';
    this.comment.parentCommentId = commentId;
    this.ownerParentCommentId = ownerParentCommentId;
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

            // send notification to owner of the parent comment
            if (this.ownerParentCommentId != this.currentUserId) {
              this.notificationService.sendNotification({
                targetId: this.post.id,
                actorId: this.currentUserId,
                actionType: ActionEnum.COMMENT_REPLY,
                redirectURL: `/post/${this.post.id}`,
                recipientId: this.ownerParentCommentId,
              });
            }

            this.comment = {};
          }
        },
        error: (error: any) => {
          console.log(error);
        },
      });
    }
  }

  async copyLink() {
    await this.textUtils.copyToClipboard(window.location.href + 'post/' + this.post.id);
    this.toastService.showSuccess('Success', 'Link copied to clipboard');
  }

  handleReportModalVisibility(event: boolean) {
    this.reportVisible = event; // Update reportVisible based on the event emitted from ReportComponent
  }

  hideDialog() {
    this.dialogVisible = false;
  }

}