import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';
import { UserService } from './../../../../core/services/user.service';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Search } from 'src/app/core/interfaces/search';
import { UserSettingService } from 'src/app/core/services/user-setting.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})

export class SearchComponent implements OnInit {
  @Input() showSearch: boolean = true;
  @Input() isMobile: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  public dataFetched: boolean = false;
  public suggestions: Search[] = []; // Array to store the suggestions
  userResponse?: UserResponse | null = this.userService.getUserResponseFromLocalStorage();
  private searchTerms = new Subject<string>(); // Subject to handle the search terms
  private searchSubscription: Subscription = new Subscription(); // Subscription to handle the search
  isLoading: boolean = false; // Flag to indicate if the data is being fetched
  @ViewChild('searchInput') searchInput: any;

  currentUserId: string = '';

  constructor(
    private userService: UserService,
    private userSettingService: UserSettingService,
    private toastService: ToastService,
    private tokenService: TokenService,
  ) {}


  ngOnInit(): void {
    this.currentUserId = this.tokenService.extractUserIdFromToken();

    this.getRecommendations(this.userResponse?.username);
    // add debounce time to search input
    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        return this.userService.searchUsers(term, term);
      }),
    ).subscribe(suggestions => {
      this.suggestions = suggestions.map(suggestion => ({
        id: suggestion.id,
        username: suggestion.username,
        followerCount: suggestion.followerCount,
      }));
      this.isLoading = false;
    });
  }


  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }
  

  closeSearch(): void {
    this.showSearch = false;
    this.onClose.emit();
  }


  private getRecommendations(username: string | undefined) {
    if (!username) {
      console.error('Username is undefined');
      return;
    }
    this.isLoading = true;
    this.userService.getUsersRecommend(username).subscribe({
      next: (response) => {
        this.suggestions = response.map((item) => ({
          id: item.id,
          username: item.username,
          // avatar: item.avtURL,
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching recommendations:', error);
        this.isLoading = false;
      },
    });
  }


  /** When type in the search input */
  public handleKeyup(event: any) {
    if(!event.target.value) {
      this.suggestions = [];
      return;
    }
    this.isLoading = true;
    this.searchTerms.next(event.target.value);
  }


  /** Clear the input field and the suggestions */
  public clickClearInput() {
    this.searchInput.nativeElement.value = '';
    this.suggestions = [];
  }


  /**
   * On upload image face to search
   * @param event 
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.clickClearInput();

      const fd = new FormData();
      fd.append('file', file);

      this.userSettingService.searchByImage(fd).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.suggestions = response.map((item: any) => ({
            id: item.id,
            username: item.username,
            followerCount: item.followerCount,
          }));
        },
        error: (error) => {
          this.isLoading = false;
          this.toastService.showError('Error', error.error.message);
          console.error('Error updating image search:', error);
        }
      });
    }
  }

}
