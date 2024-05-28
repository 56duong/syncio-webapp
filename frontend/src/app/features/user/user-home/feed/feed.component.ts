import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/core/interfaces/post';
import { PostService } from 'src/app/core/services/post.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})

export class FeedComponent {
  posts: Post[] = [];
  private newPostCreatedSubscription!: Subscription;

  constructor(
    private postService: PostService
  ) { }

  ngOnInit() {
    this.getPosts();

    // Subscribe to the new post created event to add the new post to the top of the feed.
    this.newPostCreatedSubscription = this.postService.getNewPostCreated().subscribe((post) => {
      if (post) {
        this.posts.unshift(post);
      }
    });
  }

  ngOnDestroy() {
    this.newPostCreatedSubscription.unsubscribe();
  }

  getPosts() {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
