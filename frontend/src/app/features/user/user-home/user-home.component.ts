import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { SearchComponent } from './search/search.component';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent {
  @ViewChild(SearchComponent) appSearch: SearchComponent | undefined;
  showSearch: boolean = false;
  showNotifications: boolean = false;
  isHideMenuLabel: boolean = false;

  constructor(private elementRef: ElementRef) {}

  actionToggle(event: any) {
    switch (event) {
      case 'search':
        this.showSearch = !this.showSearch;
        this.showNotifications = false;
        break;
      case 'notifications':
        this.showNotifications = !this.showNotifications;
        this.showSearch = false;
        break;
      default:
        break;
    }
  }

  closeSearch(): void {
    this.showSearch = false;
  }

}
