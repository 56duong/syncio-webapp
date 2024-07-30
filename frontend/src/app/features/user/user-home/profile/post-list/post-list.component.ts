import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})

export class PostListComponent {
  @Input() userProfileId: string = '';
  @Input() currentUserId: string = '';
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Input() sortMode: 'newest' | 'oldest' = 'newest';
  @Output() showPostDetailEvent = new EventEmitter<Post>();

  posts: Post[] = [];
  observer: IntersectionObserver | undefined; // Observer to watch the end of the posts
  @ViewChild('loading') loadingElement: any; // Reference to the end of the feed element.
  pageNumber: number = 0; // page number for infinite scroll
  pageSize: number = 12; // page size for infinite scroll
  isDecs: boolean = true;
  loading: boolean = false; // Whether the component is currently loading more posts.
  endOfPosts: boolean = false; // Indicates if the end of the posts has been reached.


  constructor(
    private postService: PostService
  ) { }


  ngOnChanges(changes: any) {
    // Reset posts when the user profile changes.
    if (changes.userProfileId && changes.userProfileId.currentValue || changes.sortMode && changes.sortMode.currentValue) {
      this.resetPosts();
      setTimeout(() => {
        this.getMorePosts();
      }, 0);
    }
  }


  ngOnDestroy() {
    // Unobserve the end of the feed element when the component is destroyed.
    if (this.endOfPosts && this.observer) {
      this.observer.unobserve(this.loadingElement.nativeElement);
    }
    this.observer = undefined;
  }


  /**
   * Reset posts when the user profile changes.
   */
  resetPosts() {
    this.pageNumber = 0;
    this.posts = [];
    this.endOfPosts = false;
    if(this.loadingElement) {
      this.observer?.unobserve(this.loadingElement.nativeElement);
    }
    this.observer = undefined;
  }


  /**
   * Get more posts when the end of the feed element is intersecting.
   */
  getMorePosts() {
    if (this.endOfPosts) return;

    if (this.observer) {
      this.observer.disconnect();
    }
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // If the end of the feed element is intersecting, get more posts.
        if (entry.isIntersecting && !this.loading && !this.endOfPosts) {
          this.getPosts(this.pageNumber, this.pageSize, this.sortMode === 'newest');
        }
      });
    });
    this.observer.observe(this.loadingElement.nativeElement);
  }


  /**
   * Get posts with number and size.
   * @param pageNumber 
   * @param pageSize 
   */
  getPosts(pageNumber: number, pageSize: number, isDesc: boolean = true) {
    const postServiceMethod = this.currentUserId 
        ? this.postService.getPostsByUserId(this.userProfileId, pageNumber, pageSize, isDesc)
        : this.postService.getPostsByUserIdNotLoggedIn(this.userProfileId, pageNumber, pageSize, isDesc);

    postServiceMethod.subscribe({
        next: (response) => {
          this.posts.push(...response.content);
          if (response.last) {
            this.endOfPosts = true;
            this.observer?.unobserve(this.loadingElement.nativeElement);
          } 
          else {
            this.pageNumber++;
          }
          this.loading = false;
          setTimeout(() => {
            this.getMorePosts();
          }, 500);
        },
        error: (error) => {
          console.error('Error getting user posts', error);
        },
    });
  }


  /**
   * When a post is clicked, emit the profile to show the post detail.
   * @param post 
   */
  handleShowPostDetail(post: Post) {
    this.showPostDetailEvent.emit(post);
  }

}
