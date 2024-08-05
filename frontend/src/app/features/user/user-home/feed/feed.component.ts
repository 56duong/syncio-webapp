import {Component, ViewChild} from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})

export class FeedComponent {
  posts: Post[] | undefined;
  suggestedPosts: Post[] | undefined;

  pageNumber: number = 0;
  pageSize: number = 10; // set số bài viết cần lấy trên 1 trang
  loading: boolean = false;

  endOfFollowing: boolean = false; // If it already shows all the posts from the users that the current user is following
  endOfInterests: boolean = false; // If it already shows all the posts from the users that the current user is interested in
  endOfFeed: boolean = false; // If it already shows all the posts from the feed
  showLoading: boolean = false; // If it is loading more posts
  postIds: string[] = []; // List of post ids that have been loaded.

  newPostCreatedSubscription!: Subscription;
  isReceivedNewPost: boolean = false; // Indicates if a new post has been created by the current user or by the users that the current user is following.

  isLogged: boolean = this.tokenService.isValidToken();

  observer: IntersectionObserver | undefined; // Observer to watch the end of the feed element.
  @ViewChild('endOfFeed') endOfFeedElement: any; // Reference to the end of the feed element.
  @ViewChild('loading') loadingElement: any; // Reference to the end of the feed element.

  audioUrl: string | null = null;

  currentUserId: string = this.tokenService.extractUserIdFromToken();

  constructor(
    private postService: PostService,
    private tokenService: TokenService
  ) {}


  ngOnInit() {
    this.getPosts();
    
    if(this.currentUserId) {
      this.postService.connectWebSocketNewPost();
      this.getNewPostObservable();
    }
  }


  ngAfterViewInit() {
    // Create an observer to watch the end of the feed element.
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // If the end of the feed element is intersecting, get more posts.
        if (entry.isIntersecting && !this.loading && !this.showLoading) {
          this.getPosts();
        }
      });
    });
    
    this.observer.observe(this.loadingElement.nativeElement);
  }


  ngOnDestroy() {
    this.postService.disconnectNewPost();
    this.newPostCreatedSubscription.unsubscribe();
    // Unobserve the end of the feed element when the component is destroyed.
    if (this.showLoading && this.observer) {
      this.observer.unobserve(this.loadingElement.nativeElement);
    }
  }


  /**
   * When receive a new post.
   */
  getNewPostObservable() {
    this.newPostCreatedSubscription = this.postService.getNewPostObservable().subscribe({
      next: (post) => {
        if (Object.keys(post).length !== 0) {
          this.isReceivedNewPost = true;
          this.postService.disconnectNewPost();
          this.newPostCreatedSubscription.unsubscribe();
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  /**
   * Load pageSize posts at a time
   */
  async getPosts() {
    this.loading = true;
    let posts: Post[] = [];
    try {
      if (this.isLogged) {
        if (!this.endOfFollowing) {
          posts = await lastValueFrom(this.postService.getPostsFollowing(this.pageNumber, this.pageSize));
          this.updatePostsState(posts, 'FOLLOWING');
        } else if (!this.endOfInterests) {
          posts = await lastValueFrom(this.postService.getPostsInterests(this.pageNumber, this.pageSize, this.postIds));
          this.updatePostsState(posts, 'INTERESTS');
        } else {
          posts = await lastValueFrom(this.postService.getPostsFeed(this.pageNumber, this.pageSize, this.postIds));
          this.updatePostsState(posts, 'FEED');
        }
      } 
      else {
        posts = await lastValueFrom(this.postService.getPostsFeed(this.pageNumber, this.pageSize, this.postIds));
        this.updatePostsState(posts, 'FEED');
      }
    } catch (error) {
      console.log(error);
    }

  }

  updatePostsState(postsPage: any, endOf: 'FOLLOWING' | 'INTERESTS' | 'FEED') {
    let posts = postsPage.content || [];

    if (!this.posts) {
      this.posts = [];
    }
    if (!this.suggestedPosts) {
      this.suggestedPosts = [];
    }

    if(endOf === 'FOLLOWING') {
      this.posts.push(...posts);
    }
    else {
      this.suggestedPosts.push(...posts);
    }
    
    // if the last page is reached, reset the pageNumber to 0 and get all the post ids
    if(postsPage.last) {
      this.pageNumber = 0;
      this.postIds = this.posts.map(post => post.id || '').concat(this.suggestedPosts.map(post => post.id || ''));
      switch(endOf) {
        case 'FOLLOWING':
          this.endOfFollowing = true;
          this.getPosts();
          break;
        case 'INTERESTS':
          this.endOfInterests = true;
          this.getPosts();
          break;
        case 'FEED':
          this.showLoading = true;
          this.endOfFeed = true;
          this.observer?.unobserve(this.loadingElement.nativeElement);
          break;
      }
    }
    else {
      this.pageNumber++;
    }
    
    this.loading = false;
  }

  /**
   * Reset the component to the initial state when the user clicks on the new post notification.
   */
  resetComponent() {
    this.posts = [];
    this.suggestedPosts = [];
    this.pageNumber = 0;
    this.loading = false;
    this.endOfFollowing = false;
    this.endOfInterests = false;
    this.showLoading = false;
    this.postIds = [];
    this.isReceivedNewPost = false;
    this.getPosts();
    if(this.currentUserId) {
      this.postService.connectWebSocketNewPost();
      this.postService.getNewPostObservable();
    }
  }

}


/**
 * When the user scrolls to the end of the feed, the getPosts method is called to load more posts.
 * First, load posts from the users that the current user is following in last 1 day.
 * If the end of the posts from the users that the current user is following has been reached, 
 * load posts from the users that the current user is interested in. (not contain the posts from the users that the current user is following)
 * If the end of the posts from the users that the current user is interested in has been reached,
 * load posts from the feed.
 */