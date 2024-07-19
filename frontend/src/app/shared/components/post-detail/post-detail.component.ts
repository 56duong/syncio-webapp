import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Comment } from 'src/app/core/interfaces/comment';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { Post } from 'src/app/core/interfaces/post';
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
  
  comment: Comment = {}; // Current comment to post
  subscriptionComments: Subscription = new Subscription(); // Subscription to the comments observable
  ownerParentCommentId: string = ''; // The id of the owner of the parent comment. Use to send notification to the owner of the parent comment.
  newReply: Comment | undefined;

  reportVisible: boolean = false; // Used to show/hide the report modal
  dialogVisible: boolean = false;
  dialogItems: any = [
    { 
      label: 'Report',
      bold: 7,
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
    private commentService: CommentService,
    private notificationService: NotificationService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private textUtils: TextUtils,
    private toastService: ToastService,
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
          // remove the query params from the url
          this.post.id = this.post.id.split('&')[0];
          // Get the post from database
          this.postService.getPostById(this.post.id).subscribe({
            next: (post) => {
              this.post = { ...post};
              this.post.photos = this.post.photos;
            },
            error: (error) => {
              console.log(error);
            },
          });
        }
      });
    }
    else {
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
    if(this.currentUserId) this.notificationService.disconnect();
  }

  closeDialog() {
    this.visibleChange.emit(false);
    this.location.replaceState('/');
  }

  addEmoji(event: any) {
    this.comment.text = `${this.comment.text || ''}${event.emoji.native}`;
  }

  /**
   * Prepares a reply to a comment.
   * @param {string} commentId - The ID of the comment being replied to.
   */
  onReply(commentId: string, ownerParentCommentId: string) {
    this.comment.text = '@Reply ';
    this.comment.parentCommentId = commentId;
    this.ownerParentCommentId = ownerParentCommentId;
  }

  postComment() {
    // Not logged in
    if(this.currentUserId == null) {
      this.router.navigate(['/login'], { 
        queryParams: { message: 'Please login to comment' } 
      });
      return;
    }

    if (!this.post.id) return;

    // Empty comment
    if (!this.comment.text || !this.comment.text.trim()) return;

    this.comment = {
      ...this.comment,
      text: this.comment.text.replace('@Reply ', ''),
      postId: this.post.id,
      userId: this.currentUserId,
      likesCount: 0,
    };

    // If the comment is a parent comment, send the comment (realtime).
    if (!this.comment.parentCommentId) {
      this.commentService.sendComment(this.comment);
      // send notification to owner of the post
      if (this.post.createdBy != this.currentUserId) {
        this.notificationService.sendNotification({
          targetId: this.post.id,
          actionPerformedId: this.comment.id,
          actorId: this.currentUserId,
          actionType: ActionEnum.COMMENT_POST,
          redirectURL: `/post/${this.post.id}?commentId=${this.comment.id}`,
          recipientId: this.post.createdBy,
        });
      }
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
            // make change to this to let child component know that a new reply has been added
            this.newReply = this.comment;
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
