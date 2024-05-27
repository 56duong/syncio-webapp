import { Component, ViewChild } from '@angular/core';
import { CreatePostComponent } from '../create-post/create-post.component';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
})
export class LeftMenuComponent {
  @ViewChild(CreatePostComponent) createPostComponent: any;
  visible: boolean = false;

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

  onCreateClick() {
    this.createPostComponent.showDialog();
  }
}
