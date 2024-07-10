import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserFollow } from 'src/app/core/interfaces/user-follow';
import { UserProfile } from 'src/app/core/interfaces/user-profile';
import { TokenService } from 'src/app/core/services/token.service';
import { UserFollowService } from 'src/app/core/services/user-follow.service';

@Component({
  selector: 'app-following-dialog',
  templateUrl: './following-dialog.component.html',
  styleUrls: ['./following-dialog.component.scss']
})

export class FollowingDialogComponent {
  @Input() isVisibleFollowing: boolean = false;
  @Input() userProfile: UserProfile = {
    id: '',
    username: '',
    followerCount: 0,
    followingCount: 0,
    avtURL: '',
    bio: '',
    posts: [],
    isFollowing: false,
    isCloseFriend: false
  }; // user profile to show

  @Output() onHide = new EventEmitter<void>(); // event to hide the followers modal
  @Output() updateFollowingCount = new EventEmitter<number>(); // event to add follow
  @Output() onFollow = new EventEmitter<string>(); // event to remove a follower

  userFollowing: UserFollow[] = []; // followers list

  observer: IntersectionObserver | undefined; // Observer to watch the end of the feed element.
  @ViewChild('loading') loadingElement: any; // Reference to the end of the feed element.
  pageNumber: number = 0; // page number for infinite scroll
  pageSize: number = 12; // page size for infinite scroll
  loading: boolean = false; // Whether the component is currently loading more posts.
  endOfFollowing: boolean = false; // Indicates if the end of the followers has been reached.

  currentUserId: string = this.tokenService.extractUserIdFromToken(); // current logged in user

  get isOwnerProfile(): boolean {
    return this.currentUserId === this.userProfile.id;
  } // check if current user is owner of the profile

  constructor(
    private tokenService: TokenService,
    private userFollowService: UserFollowService,
    private router: Router
  ) { }


  ngOnChanges(changes: any) {
    if(this.isVisibleFollowing) {
      if(!this.observer) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            // If the end of the feed element is intersecting, get more posts.
            if (entry.isIntersecting && !this.loading && !this.endOfFollowing) {
              this.getFollowers();
            }
          });
        });
        this.observer.observe(this.loadingElement.nativeElement);
      }
    }

    // Reset when the userProfile changes.
    if(changes && changes.userProfile && this.userProfile.id) {
      this.pageNumber = 0;
      this.userFollowing = [];
      this.endOfFollowing = false;
      if(this.loadingElement) {
        this.observer?.unobserve(this.loadingElement.nativeElement);
      }
      this.observer = undefined;
    }
  }


  ngOnDestroy() {
    // Unobserve the end of the feed element when the component is destroyed.
    if (this.endOfFollowing && this.observer) {
      this.observer.unobserve(this.loadingElement.nativeElement);
    }
  }
  

  /**
   * Get followers of the userProfile.
   */
  getFollowers() {
    this.loading = true;
    this.userFollowService.getFollowingsSortedByMutualFollow(this.userProfile.id, this.pageNumber, this.pageSize).subscribe({
      next: (response) => {
        this.userFollowing.push(...response.content);
        if(response.last) {
          this.endOfFollowing = true;
          this.observer?.unobserve(this.loadingElement.nativeElement);
        }
        else {
          this.pageNumber++;
        }
        this.loading = false;
        
      },
      error: (error) => {
        console.error('Error getting followers sorted by mutual follow', error);
      }
    });
  }


  /**
   * Follow user.
   * @param userFollow 
   * @returns 
   */
  addFollow(userFollow: UserFollow | undefined) {
    if(!userFollow || !userFollow.targetId) return;
    this.userFollowService.toggleFollow(userFollow.targetId).subscribe({
      next: (response) => {
        userFollow.following = response;
        // update following count
        this.userProfile.followingCount += response ? 1 : -1;
        // if action is follow, send notification to followed user
        if(response) {
          this.onFollow.emit(userFollow.targetId);
        }
        this.updateFollowingCount.emit(this.userProfile.followingCount);
      },
      error: (error) => {
        console.error('Error following user', error);
      }
    });
  }


  /**
   * Unfollow user.
   * @param userFollow 
   * @returns 
   */
  unFollow(userFollow: UserFollow | undefined) {
    if(!userFollow || !userFollow.targetId) return;
    this.userFollowService.toggleFollow(userFollow.targetId).subscribe({
      next: (response) => {
        userFollow.following = response;
        if(this.isOwnerProfile) {
          // update following count
          this.userProfile.followingCount += response ? 1 : -1;
          // remove follower from followers list
          // this.userFollowing = this.userFollowing.filter(follower => follower.targetId !== userFollow.targetId);
          this.updateFollowingCount.emit(this.userProfile.followingCount);
        }
      },
      error: (error) => {
        console.error('Error following user', error);
      }
    });
  }


  /**
   * Navigate to the profile page of the user.
   * @param userId 
   */
  navigateToProfile(userId: string | undefined) {
    if(!userId) return;
    this.router.navigate(['/profile', userId]);
    this.onHide.emit();
  }

}
