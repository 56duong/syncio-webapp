import { Component } from '@angular/core';
import { LangService } from 'src/app/core/services/lang.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  menus = [
    {
      name: 'Dashboard',
      link: ''
    },
    {
      name: 'Users Management',
      link: 'users-management'
    },
    {
      name: 'Labels Management',
      link: 'labels-management'
    },
    {
      name: 'Sticker Management',
      link: 'sticker-management'
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
      name: 'Issue Management',
      link: 'issue-management',
    },
  ];
  settingSubmenuItems = [
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      items: [
        {
          label: this.langService.getLang() === 'en' ? 'Tiếng Việt' : 'English',
          icon: 'pi pi-globe',
          command: () => {
            const lang = this.langService.getLang() === 'en' ? 'vi' : 'en';
            this.langService.setLang(lang);
            this.redirectService.reloadPage();
          },
        },
        {
          label: "Help",
          icon: 'pi pi-question-circle',
          route: '/help',
        },
        {
          label: 'Logout',
          color: 'red',
          icon: 'pi pi-sign-out',
          command: () => {
            this.logout();
          },
        },
      ],
    },
  ];

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private langService: LangService,
    private redirectService: RedirectService,
    private themeService: ThemeService,
  ) {
    this.themeService.switchTheme('theme-light');
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.userService.removeUserFromLocalStorage();
        this.tokenService.removeToken();
        this.redirectService.redirectAndReload('/login');
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
