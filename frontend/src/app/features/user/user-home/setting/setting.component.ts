import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
      title: this.translateService.instant('setting.account_setting'),
      items: [
        {
          label: this.translateService.instant('setting.edit_profile'),
          icon: 'pi pi-user',
          link: 'edit-profile',
        },
        {
          label: this.translateService.instant('setting.change_password'),
          icon: 'pi pi-lock',
          link: 'change-password',
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

  private langChangeSubscription: Subscription = new Subscription();

  constructor(
    private translateService: TranslateService,
  ) {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit() {// Subscribe to language change events
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
      this.initMenuItems();
    });
  }

  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  initMenuItems() {
    this.menus = [
      {
        title: this.translateService.instant('setting.account_setting'),
        items: [
          {
            label: this.translateService.instant('setting.edit_profile'),
            icon: 'pi pi-user',
            link: 'edit-profile',
          },
          {
            label: this.translateService.instant('setting.change_password'),
            icon: 'pi pi-lock',
            link: 'change-password',
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
