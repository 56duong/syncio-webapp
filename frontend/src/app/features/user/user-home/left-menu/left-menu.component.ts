import { Component, ViewChild } from '@angular/core';
import { CreatePostComponent } from '../create-post/create-post.component';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
})

export class LeftMenuComponent {
  @ViewChild(CreatePostComponent) createPostComponent: any;
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
      id: 'HomeButton'
    },
    {
      label: 'Search',
      icon: 'pi pi-search',
      routerLink: '/search',
      id: 'SearchButton'
    },
    {
      label: 'Messages',
      icon: 'pi pi-comments',
      routerLink: 'messages',
      id: 'MessagesButton'
    }
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
          }
        },
        {
          label: 'Story',
          icon: 'pi pi-history',
          route: '/story/create'
        }
      ]
    }
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

  onCreateClick() {
    this.createPostComponent.showDialog();
  }

}
