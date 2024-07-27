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
  isMobile: boolean = false;

  constructor() {
    this.isMobile = window.innerWidth < 768;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth < 768;
  }

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
