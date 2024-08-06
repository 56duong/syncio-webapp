import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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

  private postReportedInAdminSubscription!: Subscription;
  
  constructor(private postService: PostService,
    private reportService : ReportService,
    private router : Router) {}

  ngOnInit() {
    this.router.events.subscribe((val: any) => {
      if(val instanceof NavigationEnd) {
        let url = val.url;
        console.log('URL:', url);
        this.isReportedPostsPage = url.includes('reported-posts');
        
      }
    });
   
    this.getPosts();

    // Subscribe to the new post created event to add the new post to the top of the feed.
    // this.postService.getPostReportedInAdmin().subscribe({
    //   next: (post) => {
    //     if (post) {
    //       this.posts.unshift(post);
    //     }
    //   },
    // });
    // Subscribe to the new post created event to add the new post to the top of the feed.
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

  onHidePost(postId: string): void {
    // thoi nghi ma ilam tiep
    this.postService.setFlagToTrue(postId).subscribe({
      next: () => {
        const post = this.posts.find(post => post.id === postId);
        this.postService.setPostReportedInAdmin(post);
        this.posts = this.posts.filter(post => post.id !== postId);
      },
      error: (error) => {
        console.error('Error setting flag to true', error);
      },
    });
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
