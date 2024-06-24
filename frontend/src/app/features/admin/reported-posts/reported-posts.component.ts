import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-reported-posts',
  templateUrl: './reported-posts.component.html',
  styleUrls: ['./reported-posts.component.scss']
})
export class ReportedPostsComponent {
  posts: Post[] = [];
  
  pageNumber: number = 0;
  pageSize: number = 10; // set số bài viết cần lấy trên 1 trang
  loading: boolean = false;
  endOfFeed: boolean = false;
  
  isReportedPostsPage: boolean = true;

  private newPostCreatedSubscription!: Subscription;
  
  constructor(private postService: PostService,private reportService : ReportService,private router : Router) {}

  ngOnInit() {
    this.getPosts();
    this.isReportedPostsPage = this.router.url.includes('reported-posts');

    // Subscribe to the new post created event to add the new post to the top of the feed.
    this.postService.getNewPostCreated().subscribe({
      next: (post) => {
        if (post) {
          
          // Add the new post to the top of the feed
          this.posts.unshift(post);
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.newPostCreatedSubscription) {
      this.newPostCreatedSubscription.unsubscribe();
    }
  }

  getPosts() {

    // old
    // this.postService.getPosts().subscribe({
    //   next: (posts) => {
    //     this.posts = posts;
    //   },
    //   error: (error) => {
    //     console.log(error);
    //   },
    // });
    // old

    // new - load 10 posts at a time
    if (this.loading || this.endOfFeed) {
      return;
    }
    this.loading = true;

    this.postService.getPostReported(this.pageNumber, this.pageSize).subscribe({
      next: (posts) => {
        if (Array.isArray(posts)) {
          if (posts.length === 0) {
            this.endOfFeed = true;
          } else {
            this.posts.push(...posts);
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

  onHidePost(postId: string): void {
    this.postService.setFlagToTrue(postId).subscribe(
      () => {
        console.log('Flag set to true successfully');
        this.posts = this.posts.filter(post => post.id !== postId);
        console.log('PostId:', postId);
        
      },
      error => {
        console.error('Error setting flag to true', error);
      }
    );
  
  }

  deleteReports(postId: string): void {
    console.log('PostId:', postId);
    
    debugger;
      this.reportService.deleteReportsByPostId(postId).subscribe(
        () => {
          console.log('Reports deleted successfully');
          this.posts = this.posts.filter(post => post.id !== postId);
        },
        error => {
          console.error('Error deleting reports', error);
        }
      );
  }
}
