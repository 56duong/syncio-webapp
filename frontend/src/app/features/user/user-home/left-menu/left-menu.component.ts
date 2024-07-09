import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CreatePostComponent } from '../create-post/create-post.component';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
})
export class LeftMenuComponent {
  @ViewChild(CreatePostComponent) createPostComponent: any;

  @Output() actionToggle = new EventEmitter<string>();

  toggleSearch(): void {
    this.actionToggle.emit('search');
  }

  visible: boolean = false;
  isHideMenuLabel: boolean = false; // Hide the menu label for specific tabs
  currentTab: string = ''; // Current tab
  hideTabs: string[] = ['messages']; // Tabs to hide

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
      label: 'Notifications',
      icon: 'pi pi-heart',
      id: 'NotificationsButton',
    },
    {
      label: 'Label Shopping',
      icon: 'pi pi-shopping-cart',
      routerLink: 'labels-shop',
    },
  ];

  createSubmenuItems = [
    {
      label: 'Create',
      icon: 'pi pi-pen-to-square',
      items: [
        {
          label: 'Post',
          icon: 'pi pi-table',
          command: () => {
            this.onCreateClick();
          },
        },
        {
          label: 'Story',
          icon: 'pi pi-history',
          route: '/story/create',
        },
      ],
    },
  ]; // Submenu of the create button

  settingSubmenuItems = [
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Help',
          icon: 'pi pi-question-circle',
          route: '/help',
        }
      ],
    },
  ]; // Submenu of the Settings button

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService
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

  onCreateClick() {
    this.createPostComponent.showDialog();
  }

  toggleNotifications(): void {
    this.actionToggle.emit('notifications');
  }
  
}
