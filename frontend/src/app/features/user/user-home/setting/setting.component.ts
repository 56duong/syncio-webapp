import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})

export class SettingComponent {
  @ViewChild('container') containerElement: any;
  isMobile: boolean = false;
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

  constructor() {
    this.isMobile = window.innerWidth < 768;
  }

  scrollToBehavior(direction: 'left' | 'right') {
    if(direction === 'left') {
      this.containerElement.nativeElement.scrollLeft -= this.containerElement.nativeElement.scrollWidth;
    }
    else {
      this.containerElement.nativeElement.scrollLeft += this.containerElement.nativeElement.scrollWidth;
    }
  }

}
