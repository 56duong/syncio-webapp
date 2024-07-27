import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/core/services/lang.service';
import { CreatePostComponent } from '../../create-post/create-post.component';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-mobile-top-menu',
  templateUrl: './mobile-top-menu.component.html',
  styleUrls: ['./mobile-top-menu.component.scss']
})

export class MobileTopMenuComponent {
  @ViewChild(CreatePostComponent) createPostComponent: any;
  currentUserId: string = '';
  
  settingSubmenuItems: any[] = [
    {
      icon: 'pi pi-cog',
      items: [
        {
          label: this.langService.getLang() === 'en' ? 'Tiếng Việt' : 'English',
          icon: 'pi pi-globe',
          command: () => {
            const lang = this.langService.getLang() === 'en' ? 'vi' : 'en';
            this.langService.setLang(lang);
            window.location.reload();
          },
        },
        {
          label: this.translateService.instant('help'),
          icon: 'pi pi-question-circle',
          route: '/help',
        }
      ],
    },
  ];

  createSubmenuItems = [
    {
      icon: 'pi pi-pen-to-square',
      items: [
        {
          label: this.translateService.instant('post'),
          icon: 'pi pi-table',
          command: () => {
            this.onCreateClick();
          },
        },
        {
          label: this.translateService.instant('story'),
          icon: 'pi pi-history',
          route: '/story/create',
        },
      ],
    },
  ];

  constructor(
    private langService: LangService,
    private translateService: TranslateService,
    private tokenService: TokenService,
    private userService: UserService,
  ) { }


  ngOnInit(): void {
    this.currentUserId = this.tokenService.extractUserIdFromToken();

    if(this.currentUserId) {
      this.settingSubmenuItems[0].items.push({
        label: this.translateService.instant('logout'),
        color: 'red',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        },
      });
    }
  }


  reloadPage() {
    window.location.reload();
  }


  onCreateClick() {
    this.createPostComponent.showDialog();
  }


  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.userService.removeUserFromLocalStorage();
        this.tokenService.removeToken();
        window.location.href = '/login';
      },
      error: (error) => {
        console.log(JSON.stringify(error));
        this.userService.removeUserFromLocalStorage();
        this.tokenService.removeToken();
        window.location.href = '/login';
      }
    });
  }

}
