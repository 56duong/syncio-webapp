import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Comment } from 'src/app/core/interfaces/comment';
import { Post } from 'src/app/core/interfaces/post';
import { CommentService } from 'src/app/core/services/comment.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})

export class PostDetailComponent {
  @Input() post: Post = {};
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter();
  isEmojiPickerVisible: boolean = false;
  comments: Comment[] = [];
  comment: Comment = {};
  plainComment: string = ''; // Plain text comment
  showReplies: { 
    [id: string]: { 
      visible: boolean, 
      data: Comment[] 
    } 
  } = {};

  constructor(
    private commentService: CommentService
  ) { }

  ngOnInit() {
    this.getComments();

    setTimeout(() => {
      this.post.photos = [
        'https://cdn.sanity.io/images/7ovaqeih/production/cc2337de05cde4468a48336987c35b4e2657007c-2043x3079.jpg?w=1920&fit=max&auto=format',
        'https://cdn.sanity.io/images/7ovaqeih/production/9364ed40f8c3e3214bbd15a37548b572e35cc015-4320x6480.jpg?w=1920&fit=max&auto=format',
        'https://cdn.sanity.io/images/7ovaqeih/production/8360f7adb890c871162ff93c9f672915a4e4a456-3138x4628.jpg?w=1920&fit=max&auto=format',
        'https://cdn.sanity.io/images/7ovaqeih/production/c925336b6bb10c6b1773295d225749d0cb4c0566-6391x4261.jpg?w=1920&fit=max&auto=format'
      ];
    }, 0)
  
  }

  /**
   * Get comments for the post. The comment is a parent comment if the parentCommentId is null.
   */
  getComments() {
    if(!this.post.id) return;

    this.commentService.getParentComments(this.post.id).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
  
  closeDialog() {
    this.visibleChange.emit(false);
  }
  
  addEmoji(event: any) {
    this.comment.text = `${this.comment.text || ''}${event.emoji.native}`;
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
    if(this.showReplies[commentId]) {
      // Toggle visibility of replies
      this.showReplies[commentId].visible = !this.showReplies[commentId].visible;
    }
    else {
      // Initialize the replies object
      this.showReplies[commentId] = {
        visible: true,
        data: []
      };

      if(!this.post.id) return;

      // If replies have not been fetched yet, fetch them
      this.commentService.getReplies(this.post.id, commentId).subscribe({
        next: (replies) => {
          this.showReplies[commentId].data = replies;
        },
        error: (error) => {
          console.log(error);
        }
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
    this.comment.parentCommentId = this.comment.text?.includes('@Reply&nbsp;') ? this.comment.parentCommentId : undefined;
  }

  postComment() {
    if(!this.plainComment.trim()) return;

    if(!this.post.id) return;
    
    this.comment = {
      ...this.comment,
      text: this.comment.text?.replaceAll('<p><br></p>', '').replace('@Reply&nbsp;', ''),
      postId: this.post.id,
      userId: '6a48f7d0-090b-4637-a7e0-ac370208b3d2'
    };

    this.commentService.postComment(this.comment).subscribe({
      next: (id) => {
        this.comment = {
          ...this.comment,
          id: id,
          createdDate: 'now'
        };

        if(!this.comment.parentCommentId) {
          // Add the comment to array.
          this.comments.unshift(this.comment);
        }
        else {
          // Add the comment to the showReplies.data array.
          if(!this.showReplies[this.comment.parentCommentId]) {
            // Initialize the replies object
            this.showReplies[this.comment.parentCommentId] = {
              visible: true,
              data: []
            };
          }
          
          // +1 the replies count for the parent comment.
          const parentComment = this.comments.find((comment) => comment.id === this.comment.parentCommentId);
          if(parentComment) {
            parentComment.repliesCount = (this.comment.repliesCount ?? 0) + 1;
          }

          this.showReplies[this.comment.parentCommentId].data.unshift(this.comment);
        }
        
        this.comment = {};
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  }

}
