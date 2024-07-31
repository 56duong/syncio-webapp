import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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
      title: this.translateService.instant('howYouUseSyncio'),
      items: [
        {
          label: this.translateService.instant('editProfile'),
          icon: 'pi pi-user',
          link: 'edit-profile',
        }
      ]
    },
    {
      title: this.translateService.instant('howPeopleFindAndContactYou'),
      items: [
        {
          label: this.translateService.instant('imageSearch'),
          icon: 'pi pi-image',
          link: 'image-search',
        }
      ]
    }
  ];

  constructor(
    private translateService: TranslateService,
  ) {
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
