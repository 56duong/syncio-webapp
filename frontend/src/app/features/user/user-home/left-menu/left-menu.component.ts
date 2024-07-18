import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CreatePostComponent } from '../create-post/create-post.component';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';
import { color } from 'html2canvas/dist/types/css/types/color';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/core/services/lang.service';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
})
export class LeftMenuComponent {
  @ViewChild(CreatePostComponent) createPostComponent: any;

  @Output() actionToggle = new EventEmitter<string>();

  toggleSearch(): void {
    this.actionToggle.emit('search');
  }

  visible: boolean = false;
  isHideMenuLabel: boolean = false; // Hide the menu label for specific tabs
  currentTab: string = ''; // Current tab
  hideTabs: string[] = ['messages']; // Tabs to hide

  currentUserId: string = '';
  currentUsername: string = '';

  menus: any[] = [];

  createSubmenuItems: any[] = []; // Submenu of the create button

  settingSubmenuItems: any[] = []; // Submenu of the Settings button

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService,
    private translateService: TranslateService,
    private langService: LangService
  ) { }


  ngOnInit() {
    console.log(this.translateService.instant('home'))
    this.menus = [
      {
        label: this.translateService.instant('home'),
        icon: 'pi pi-home',
        routerLink: '/',
        id: 'HomeButton',
      },
      {
        label: this.translateService.instant('search'),
        icon: 'pi pi-search',
        id: 'SearchButton',
      },
      {
        label: this.translateService.instant('messages'),
        icon: 'pi pi-comments',
        routerLink: 'messages',
        id: 'MessagesButton',
      },
      {
        label: this.translateService.instant('notifications'),
        icon: 'pi pi-heart',
        id: 'NotificationsButton',
      },
      {
        label: this.translateService.instant('labelShopping'),
        icon: 'pi pi-shopping-cart',
        routerLink: 'labels-shop',
      },
    ];
    this.createSubmenuItems = [
      {
        label: this.translateService.instant('create'),
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
    this.settingSubmenuItems = [
      {
        label: this.translateService.instant('settings'),
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
          },
          {
            label: this.translateService.instant('logout'),
            color: 'red',
            icon: 'pi pi-sign-out',
            command: () => {
              this.logout();
            },
          }
        ],
      },
    ];
    
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    this.currentUsername = this.tokenService.extractUsernameFromToken();

    // Get the current tab when routing changes
    this.router.events.subscribe(() => {
      this.currentTab = this.router.url.split('/')[1].split('?')[0];
      this.isHideMenuLabel = this.hideTabs.includes(this.currentTab);
    });
  }
  onSearchClick(): void {
    this.router.navigate(['/search']);
  }

  onCreateClick() {
    this.createPostComponent.showDialog();
  }

  toggleNotifications(): void {
    this.actionToggle.emit('notifications');
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.userService.removeUserFromLocalStorage();
        this.tokenService.removeToken();
        window.location.href = '/login';
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  
}
