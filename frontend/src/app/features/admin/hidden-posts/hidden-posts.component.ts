import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';

@Component({
  selector: 'app-hidden-posts',
  templateUrl: './hidden-posts.component.html',
  styleUrls: ['./hidden-posts.component.scss']
})
export class HiddenPostsComponent {
  posts: Post[] = [];
  
  pageNumber: number = 0;
  pageSize: number = 10; // set số bài viết cần lấy trên 1 trang
  loading: boolean = false;
  endOfFeed: boolean = false;
  
  isHiddenPostsPage: boolean = true;

  private postReportedInAdminSubscription!: Subscription;
  
  constructor(
    private postService: PostService,
    private router : Router) {}

  ngOnInit() {
    this.router.events.subscribe((val) => {
      if(val instanceof NavigationEnd) {
        let url = val.url;
        console.log('URL:', url);
        this.isHiddenPostsPage = url.includes('hidden-posts');
        
      }
    });

    this.getPosts();

    // Subscribe to the new post created event to add the new post to the top of the feed.
    // this.postService.getPostReportedInAdmin().subscribe({
    //   next: (post) => {
    //     console.log('Post:', post);
    //     if (post) {
    //       this.posts.unshift(post);
    //     }
    //   },
    // });
    this.postReportedInAdminSubscription = this.postService.getPostReportedInAdmin().subscribe({
      next: (post) => {
        if (post) {
          const postExists = this.posts.some(existingPost => existingPost.id === post.id);
          if (!postExists) {
            this.posts.unshift(post);
          }
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.postReportedInAdminSubscription) {
      this.postReportedInAdminSubscription.unsubscribe();
    }
  }

  getPosts() {
    // new - load 10 posts at a time
    if (this.loading || this.endOfFeed) {
      return;
    }
    this.loading = true;
    this.postService.getPostHidden(this.pageNumber, this.pageSize).subscribe({
      next: (posts) => {
        if (Array.isArray(posts)) {
          if (posts.length === 0) {
            this.endOfFeed = true;
          } else {
            const newPosts = posts.filter(post => !this.posts.some(existingPost => existingPost.id === post.id));
            this.posts.push(...newPosts);
            this.pageNumber++;
          }
        } else {
          console.error('API response is not an array', posts);
        }
        this.loading = false;
      },
      error: (error) => {
        console.log(error);
        this.loading = false;
      },
    });
    // new
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      this.getPosts();
    }
  }

  onActivePost(postId: string): void {
    this.postService.setFlagToFalse(postId).subscribe({
      next: () => {
        const post = this.posts.find(post => post.id === postId);
        this.postService.setPostReportedInAdmin(post);
        this.posts = this.posts.filter(post => post.id !== postId);
        
      },
      error: (error) => {
        console.log(error)
      }
    });
  }
}
