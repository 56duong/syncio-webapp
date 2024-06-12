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

  constructor(private elementRef: ElementRef) {}

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    console.log('this.showSearch', this.showSearch);
  }
  closeSearch(): void {
    this.showSearch = false;
  }
}
