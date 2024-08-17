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
      title: this.translateService.instant('setting.how_you_use_syncio'),
      items: [
        {
          label: this.translateService.instant('setting.edit_profile'),
          icon: 'pi pi-user',
          link: 'edit-profile',
        }
      ]
    },
    {
      title: this.translateService.instant('setting.how_people_find_and_contact_you'),
      items: [
        {
          label: this.translateService.instant('setting.image_search'),
          icon: 'pi pi-image',
          link: 'image-search',
        },
        {
          label: this.translateService.instant('setting.messages'),
          icon: 'pi pi-comments',
          link: 'message-controls',
        }
      ]
    },
    {
      title: this.translateService.instant('setting.who_can_see_your_content'),
      items: [
        {
          label: this.translateService.instant('setting.close_friends'),
          icon: 'pi pi-star-fill',
          link: 'close-friends',
        }
      ]
    },
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
