import { Component } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})

export class SettingComponent {
  menus = [
    {
      title: 'How you use Syncio',
      items: [
        {
          label: 'Edit profile',
          icon: 'pi pi-user',
          link: 'edit-profile',
        }
      ]
    },
    {
      title: 'How people find and contact you',
      items: [
        {
          label: 'Image Search',
          icon: 'pi pi-image',
          link: 'image-search',
        }
      ]
    }
  ];
}
