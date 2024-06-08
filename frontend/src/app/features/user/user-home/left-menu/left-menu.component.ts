import { Component, ViewChild } from '@angular/core';
import { CreatePostComponent } from '../create-post/create-post.component';
import { Router } from '@angular/router';

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

  menus: any[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
    },
    {
      label: 'Search',
      icon: 'pi pi-search',
      routerLink: '/search',
    },
    {
      label: 'Messages',
      icon: 'pi pi-comments',
      routerLink: 'messages',
    },
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: 'profile',
    },
  ];

  constructor(
    private router: Router
    
  ) { }

  ngOnInit() {
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
