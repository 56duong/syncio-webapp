import { UserService } from './../../../../core/services/user.service';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Search } from 'src/app/core/interfaces/search';
import { UserResponse } from 'src/app/features/authentication/login/user.response';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() showSearch: boolean = true;
  @Output() onClose = new EventEmitter<void>();
  public clickInput: boolean = false;
  public dataFetched: boolean = false;
  public searchKey: string = '';
  public imgUrl: string = '/assets/img/userdata/';
  public suggestions: Search[] = [];
  userResponse?: UserResponse | null =
    this.userService.getUserResponseFromLocalStorage();

  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private elRef: ElementRef
  ) {}
  closeSearch(): void {
    this.showSearch = false;
    this.onClose.emit();
  }

  ngOnInit(): void {
    this.getRecommendations(this.userResponse?.username);
  }

  private getRecommendations(username: string | undefined) {
    if (!username) {
      console.error('Username is undefined');
      return;
    }
    this.userService.getUsersRecommend(username).subscribe({
      next: (response) => {
        this.suggestions = response.map((item) => ({
          id: item.id,
          username: item.username,
          avatar: item.avtURL,
        }));
        this.dataFetched = true; // Update the state to show that data has been fetched
      },
      error: (error) => {
        console.error('Error fetching recommendations:', error);
        this.dataFetched = false; // Update the state to indicate that fetching data failed
      },
    });
  }

  public onClickInput() {
    const searchInput = document.getElementById('nav-search-input');
    if (searchInput) {
      searchInput.focus();
    }
    this.clickInput = true;
    this.dataFetched = true;
  }

  public handleKeyup(e: any) {
    this.dataFetched = false;
    this.searchKey = e.target.value;
    this.userService.getUsers(e.target.value).subscribe((suggestions) => {
      this.dataFetched = true;
      this.suggestions;
      this.suggestions.splice(0, this.suggestions.length);
      for (let i = 0; i < suggestions.length; i++) {
        this.suggestions.push({
          id: suggestions[i].id,
          username: suggestions[i].username,
          avatar: suggestions[i].avtURL,
          followerCount: suggestions[i].followerCount,
        });
      }
    });
  }

  public clickSuggestion(e: any) {}

  public clickClearInput(e: any) {
    this.searchKey = '';
    this.clickInput = false;
    this.suggestions = [];
  }
}
