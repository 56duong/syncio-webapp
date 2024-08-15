import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, of, Subject, Subscription, switchMap } from 'rxjs';
import { UserFollowingCloseFriend } from 'src/app/core/interfaces/user-following-close-friend';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserCloseFriendService } from 'src/app/core/services/user-close-friend.service';

@Component({
  selector: 'app-close-friends',
  templateUrl: './close-friends.component.html',
  styleUrls: ['./close-friends.component.scss']
})

export class CloseFriendsComponent {

  /** All the close friends to search */
  userFollowingCloseFriends: UserFollowingCloseFriend[] = [];
  /** All the close friends to show */
  userFollowingCloseFriendsShow: UserFollowingCloseFriend[] = [];
  /** Selected close friends */
  selectedCloseFriends: string[] = [];

  private searchTerms = new Subject<string>(); // Subject to handle the search terms
  private searchSubscription: Subscription = new Subscription(); // Subscription to handle the search

  constructor(
    private closeFriendService: UserCloseFriendService,
    private userCloseFriendService: UserCloseFriendService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) { }


  ngOnInit() {
    this.closeFriendService.getFollowingCloseFriends().subscribe({
      next: (closeFriends) => {
        this.userFollowingCloseFriends = closeFriends;
        this.userFollowingCloseFriendsShow = Array.from(closeFriends);
        this.selectedCloseFriends = closeFriends.filter(closeFriend => closeFriend.closeFriend)
                                                .map(closeFriend => closeFriend.targetId ?? '');
      }, error: (error) => {
        console.error(error);
      }
    });

    // add debounce time to search input
    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        return of(this.userFollowingCloseFriends.filter(user => 
          user.targetUsername?.toLowerCase().includes(term.toLowerCase())
        ));
      }),
    ).subscribe(filteredUsers => {
      this.userFollowingCloseFriendsShow = filteredUsers;
    });
  }


  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }


  /**
   * Toggle close friend.
   * @param targetId the user id to add/remove from close friends
   */
  toggleCloseFriend(targetId: string | undefined) {
    if (!targetId) return;
    this.userCloseFriendService.toggleCloseFriend(targetId).subscribe({
      next: (response) => {
        this.toastService.showSuccess(
          this.translateService.instant('common.success'),
          this.translateService.instant('close_friends.setting_saved')
        );
      },
      error: (error) => {
        console.error('Error toggling close friends', error);
      },
    });
  }


  /** When type in the search input */
  public handleKeyup(event: any) {
    this.searchTerms.next(event.target.value);
  }

}
