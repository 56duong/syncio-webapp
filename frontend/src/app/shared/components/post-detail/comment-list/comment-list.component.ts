import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { Comment } from 'src/app/core/interfaces/comment';
import { ActionEnum } from 'src/app/core/interfaces/notification';
import { Post } from 'src/app/core/interfaces/post';
import { CommentLikeService } from 'src/app/core/services/comment-like.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})

export class CommentListComponent {
  @Input() post: Post = {} as Post; // current post
  @Input() currentUserId: string | null = null; // current user id
  @Input() comment: Comment = {} as Comment; // current comment to post
  @Input() newReply: Comment | undefined; // new reply to add to the replies array of the parent comment, get from the parent component when it has changes
  @Output() onReplyEvent: EventEmitter<any> = new EventEmitter<any>(); // event emitter to reply to a comment

  comments: Comment[] = []; // List of parent comments
  commentLikes: { 
    [id: string]: boolean;
  } = {}; // The likes for a comment by logged in user (key is the comment id)
  subscriptionComments: Subscription = new Subscription(); // Subscription to the comments observable

  routeParamsSub: Subscription | undefined; // Subscription to the route params to highlight the comment

  constructor(
    private commentLikeService: CommentLikeService,
    private commentService: CommentService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private router: Router
  ) { 
    this.subscribeToQueryParams();
  }

  /**
   * Subscribe to the route query params to highlight the comment.
   * This is called when the component is initialized and when the route changes.
   * It will get the commentId and parentCommentId from the query params and highlight the comment.
   */
  subscribeToQueryParams() {
    this.routeParamsSub?.unsubscribe();
    this.routeParamsSub = this.activatedRoute.queryParams.subscribe((queryParams: Params) => {
      const { commentId, parentCommentId } = queryParams;
      this.focusOnComment(commentId, parentCommentId);
    });
  }

  ngOnInit() {
    // Subscribe to route postId changes
    this.route.params.subscribe(params => {
      // If user is logged in, connect to the WebSocket and get the comments observable.
      if (this.post.id && this.currentUserId) {
        this.commentService.disconnect();
        this.subscriptionComments.unsubscribe();

        this.commentService.connectWebSocket(this.post.id);
        this.getCommentsObservable();
      }

      this.getComments();

      setTimeout(() => {
        this.post.photos = this.post.photos;
      }, 0);
    });
  }

  ngOnChanges(changes: any) {
    // when a new reply is posted, add it to the replies array of the parent comment.
    if (changes.newReply && changes.newReply.currentValue) {
      this.addNewReplyToParent();
    }
  }

  ngOnDestroy() {
    if(this.post.id) this.commentService.disconnect();
    this.subscriptionComments.unsubscribe();
    if(this.routeParamsSub) this.routeParamsSub.unsubscribe();
  }

  /**
   * Add the new reply to the replies array of the parent comment.
   * Set the replies count of the parent comment to +1.
   * If the replies have not been fetched yet, fetch them.
   * Also set the visible to true.
   */
  addNewReplyToParent() {
    const parentComment = this.comments.find(
      (comment) => comment.id === this.newReply?.parentCommentId
    );
    if (parentComment) {
      // +1 the replies count for the parent comment.
      parentComment.repliesCount = (parentComment.repliesCount ?? 0) + 1;
      // Check if the replies have been fetched yet.
      if((parentComment.repliesCount ?? 0) > 0 && !parentComment.replies) {
        this.viewReplies(parentComment).then(() => {
        }).catch((error) => {
          console.error('Error in viewReplies:', error);
        });
      }
      else {
        // Add the comment to the replies array of the parent comment.
        if(!parentComment.replies) parentComment.replies = [];
        parentComment.replies.unshift(this.newReply || {} as Comment);
        // set visible to true
        parentComment.isShowReplies = true;
      }
    }
  }

  /**
   * Scroll to the comment with the given id
   * @param id The id of the comment to scroll to
   */
  scrollToComment(id: string): void {
    const element = document.getElementById(id);
    element?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'start' 
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
        // Initialize the comment likes and check if the user has liked the comment.
        this.comments.forEach((comment) => {
          if(!comment.id || !this.currentUserId) return;
          this.commentLikes[comment.id] = this.hasCommentLiked(comment.id);
        });
        
        // Get the commentId and parentCommentId from the query params and highlight the comment.
        const urlParams = new URLSearchParams(window.location.search);
        const commentId = urlParams.get('commentId');
        const parentCommentId = urlParams.get('parentCommentId');
        this.focusOnComment(commentId || '', parentCommentId || '');
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  /**
   * Highlights and scrolls to a specific comment in the comment list.
   * If the comment is a parent comment (i.e., it does not have a parentCommentId), the method directly scrolls to and highlights the comment.
   * If the comment is a reply (i.e., it has a parentCommentId), the method first ensures that the replies for the parent comment are visible. After the replies are made visible, it then scrolls to and highlights the parent comment, assuming the reply is nested under it.
   * @param commentId The ID of the comment to highlight.
   * @param parentCommentId The ID of the parent comment if this is a reply.
   */
  focusOnComment(commentId: string, parentCommentId: string) {
    if (commentId) {
      setTimeout(() => {
        if (!parentCommentId) {
          // if the comment is a parent comment, scroll to the comment
          this.scrollAndHighlightComment(commentId);
        }
        else {
          // if the comment is a reply, view the replies and then scroll to the comment
          const parentComment = this.comments.find((comment) => comment.id === parentCommentId);
          this.viewReplies(parentComment || {} as Comment).then(() => {
            setTimeout(() => {
              this.scrollAndHighlightComment(parentCommentId);
            }, 300);  
          }).catch((error) => {
            console.error('Error in viewReplies:', error);
          });
        }
      }, 300);
    }
  }

  /**
   * Scrolls to and highlights a comment.
   * @param commentId The ID of the comment to scroll to and highlight.
   */
  scrollAndHighlightComment(commentId: string) {
    const element = document.getElementById(commentId);
    this.scrollToComment(commentId);
    element?.classList.remove('highlight');
    void element?.offsetHeight;
    element?.classList.add('highlight');
  }

  /**
   * When receiving a new comment of other users, 
   * the comment of the current user will be appended to comments array immediately by using next() method of the observable.
   * Subscribe to the comments observable to get the Comment object in real-time.
   */
  getCommentsObservable() {
    this.subscriptionComments = this.commentService.getCommentsObservable().subscribe({
      next: (comment) => {
        this.comments.unshift({ ...comment, createdDate: this.translateService.instant('date_time.just_now') });
        // send notification to owner of the post
        // need to place here because we need to get the comment id, 
        // and the comment id is generated in the backend, 
        // cause we cant get the comment id from sendComment method in frontend
        if (comment.userId === this.currentUserId && this.post.createdBy != this.currentUserId) {
          this.notificationService.sendNotification({
            targetId: this.post.id,
            actionPerformedId: comment.id,
            actorId: this.currentUserId || '',
            actionType: ActionEnum.COMMENT_POST,
            redirectURL: `/post/${this.post.id}?commentId=${comment.id}`,
            recipientId: this.post.createdBy,
          });
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

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

  /**
   * View replies for a comment. If replies have not been fetched yet, fetch them.
   * @param commentId - The comment id.
   */
  async viewReplies(comment: Comment) {
    // Hide replies if they are already shown
    if (comment.isShowReplies) {
      comment.isShowReplies = false;
      return;
    }
  
    // Check if the post ID is available
    if (!this.post.id) return;
  
    if(comment.replies) {
      comment.isShowReplies = true;
    }
    else {
      // Fetch the replies if they have not been fetched yet
      try {
        const replies = await firstValueFrom(this.commentService.getReplies(this.post.id, comment.id || ''));
        comment.replies = replies;
        // fetch the likes for the replies
        comment.replies.forEach((reply) => {
          if (!reply.id || !this.currentUserId) return;
          this.commentLikes[reply.id] = this.hasCommentLiked(reply.id);
        });
  
        comment.isShowReplies = true;
      } catch (error) {
        console.error(error);
      }
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

  /**
   * Prepares a reply to a comment.
   * @param {string} commentId - The ID of the comment being replied to.
   * @param {string} ownerParentCommentId - The ID of the parent comment.
   */
  onReply(commentId: string, ownerParentCommentId: string) {
    this.onReplyEvent.emit({ commentId: commentId, ownerParentCommentId: ownerParentCommentId});
  }


  /**
   * Handle the click event on the post caption.
   * @param event 
   */
  handleClick(event: MouseEvent) {
    // Check if the click event target is a .profile-link element
    const target = event.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('data-link')) {
      event.preventDefault();
      const profileUrl = target.getAttribute('data-link');
      this.router.navigate([profileUrl]);
    }
  }

}
