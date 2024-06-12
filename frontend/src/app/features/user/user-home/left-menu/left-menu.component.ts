import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CreatePostComponent } from '../create-post/create-post.component';
import { Router } from '@angular/router';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { TokenService } from 'src/app/core/services/token.service';


@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
})
export class LeftMenuComponent {
  
  @ViewChild(CreatePostComponent) createPostComponent: any;

  @Output() searchToggle = new EventEmitter<void>();

  toggleSearch(): void {
    this.searchToggle.emit();
  }

  visible: boolean = false;
  isHideMenuLabel: boolean = false; // Hide the menu label for specific tabs
  currentTab: string = ''; // Current tab
  hideTabs: string[] = ['messages']; // Tabs to hide
  userResponse?: UserResponse | null =
    this.userService.getUserResponseFromLocalStorage();

  currentUserId: string = '';


  menus: any[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
      id: 'HomeButton',
    },
    {
      label: 'Search',
      icon: 'pi pi-search',
      id: 'SearchButton',
    },
    {
      label: 'Messages',
      icon: 'pi pi-comments',
      routerLink: 'messages',

      id: 'MessagesButton',
    },
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: this.profileRouterLink,
      id: 'ProfileButton',
    },

  ];
  get profileRouterLink() {
    const userId = this.userResponse?.id;
    return userId ? ['/profile', userId] : ['/profile'];
  }
  createSubmenuItems = [
    {
      label: 'Create',
      icon: 'pi pi-pen-to-square',
      items: [
        {
          label: 'Post',
          icon: 'pi pi-table',
        },
        {
          label: 'Story',
          icon: 'pi pi-history',
          route: '/story/create',
        },
      ],
    },
  ]; // Submenu of the create button


  constructor(
    private router: Router,
    private tokenService: TokenService
  ) { }


  ngOnInit() {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    
    // Get the current tab when routing changes
    this.router.events.subscribe(() => {
      this.currentTab = this.router.url.split('/')[1].split('?')[0];
      this.isHideMenuLabel = this.hideTabs.includes(this.currentTab);
    });
  }
  onSearchClick(): void {
    this.router.navigate(['/search']);
  }

}
