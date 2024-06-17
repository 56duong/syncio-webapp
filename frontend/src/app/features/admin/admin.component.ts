import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  menus = [
    {
      name: 'Dashboard',
      link: '',
    },
    {
      name: 'Users Management',
      link: 'users-management',
    },
    {
      name: 'Posts Management',
      link: 'posts-management',
    },
    {
      name: 'Reported Posts',
      link: 'reported-posts',
    },
    {
      name: 'Hidden Posts',
      link: 'hidden-posts',
    },
    {
      name: 'Labels Management',
      link: 'labels-management'
    },
    {
      name: 'Sticker Management',
      link: 'sticker-management'
    }
  ]
}
