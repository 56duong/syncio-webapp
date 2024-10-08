import { ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CreatePostComponent } from '../../create-post/create-post.component';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/core/services/lang.service';
import { UserLabelInfoService } from'src/app/core/services/user-label-info.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { LoginDialogService } from 'src/app/core/services/login-dialog.service';
import { Subscription } from 'rxjs';
import { MessagesComponent } from '../../messages/messages.component';
import { MessageContentService } from 'src/app/core/services/message-content.service';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  providers: [MessagesComponent],
})

export class LeftMenuComponent {
  @ViewChild(CreatePostComponent) createPostComponent: any;
  @Output() actionToggle = new EventEmitter<any>();

  visible: boolean = false;
  isHideMenuLabel: boolean = false; // Hide the menu label for specific tabs
  currentTab: string = ''; // Current tab
  hideTabs: string[] = ['messages']; // Tabs to hide

  currentUserId: string = '';
  currentUsername: string = '';

  menus: any[] = [];

  createSubmenuItems: any[] = []; // Submenu of the create button

  settingSubmenuItems: any[] = []; // Submenu of the Settings button

  gifUrl: string = '';

  currentTheme: string = 'theme-light';

  /** Indicates if the report a problem dialog is visible */
  isVisibleReportAProblem: boolean = false;

  private langChangeSubscription: Subscription = new Subscription(); // subscription to the language change event

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService,
    private translateService: TranslateService,
    private langService: LangService,
    private userLabelInfoService: UserLabelInfoService,
    public redirectService: RedirectService,
    private themeService: ThemeService,
    private loginDialogService: LoginDialogService,
    private cdr: ChangeDetectorRef,
    private messageContentService: MessageContentService,
  ) { }


  ngOnInit() {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    this.currentUsername = this.tokenService.extractUsernameFromToken();
    this.currentTheme = this.themeService.getCurrentTheme();

    this.initializeMenuItems();
    // Subscribe to language change events
    this.langChangeSubscription = this.translateService.onLangChange.subscribe(() => {
      this.initializeMenuItems();
      this.cdr.detectChanges(); // Manually trigger change detection
    });

    // Get the current tab when routing changes
    this.router.events.subscribe(() => {
      this.currentTab = this.router.url.split('/')[1].split('?')[0];
      this.isHideMenuLabel = this.hideTabs.includes(this.currentTab);
    });

    // user-label
    this.userLabelInfoService.getLabelURL(this.currentUserId).subscribe({
      next: (resp) => {
        if (resp) {
          this.gifUrl = resp;
        } else {
          this.gifUrl = ''; // gifUrl là undefined nếu resp là null
        }
      },
      error: (error) => {
        this.gifUrl = ''; // gifUrl là undefined nếu có lỗi
      }
    });

    // message
    if(this.currentUserId) {
      this.messageContentService.existsUnseenMessages().subscribe({
        next: (resp) => {
          if(resp) {
            document.getElementById('MessagesButton')?.classList.add('has-unseen-messages');
          }
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }


  ngOnDestroy() {
    // Unsubscribe to avoid memory leaks
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }


  initializeMenuItems() {
    this.menus = [
      {
        label: this.translateService.instant('left_menu.home'),
        icon: 'pi pi-home',
        routerLink: '/',
        id: 'HomeButton',
      },
      {
        label: this.translateService.instant('left_menu.search'),
        icon: 'pi pi-search',
        id: 'SearchButton',
      },
      {
        label: this.translateService.instant('left_menu.messages'),
        icon: 'pi pi-comments',
        id: 'MessagesButton',
      },
      {
        label: this.translateService.instant('left_menu.notifications'),
        icon: 'pi pi-heart',
        id: 'NotificationsButton',
      },
      {
        label: this.translateService.instant('left_menu.label_shopping'),
        icon: 'pi pi-shopping-cart',
        routerLink: 'labels-shop',
      },
    ];
    this.createSubmenuItems = [
      {
        label: this.translateService.instant('left_menu.create'),
        icon: 'pi pi-pen-to-square',
        items: [
          {
            label: this.translateService.instant('left_menu.post'),
            icon: 'pi pi-table',
            command: () => {
              this.onCreateClick();
            },
          },
          {
            label: this.translateService.instant('left_menu.story'),
            icon: 'pi pi-history',
            command: () => {
              this.onCreateStoryClick();
            },
          },
        ],
      },
    ];
    this.settingSubmenuItems = [
      {
        label: this.translateService.instant('left_menu.settings'),
        icon: 'pi pi-cog',
        items: [
          {
            label: this.currentTheme === 'theme-light' ? this.translateService.instant('left_menu.dark_mode') : this.translateService.instant('left_menu.light_mode'),
            icon: 'pi ' + (this.currentTheme === 'theme-light' ? 'pi-moon' : 'pi-sun'),
            command: () => {
              this.themeService.switchTheme(this.currentTheme === 'theme-light' ? 'theme-dark' : 'theme-light');
              this.updateTheme()
            },
          },
          {
            label: this.langService.getLang() === 'en' ? 'Tiếng Việt' : 'English',
            icon: 'pi pi-globe',
            command: () => {
              const lang = this.langService.getLang() === 'en' ? 'vi' : 'en';
              this.langService.setLang(lang);
            },
          },
          {
            label: this.translateService.instant('left_menu.help'),
            icon: 'pi pi-question-circle',
            route: '/help',
          },
          {
            label: this.translateService.instant('left_menu.report_a_problem'),
            icon: 'pi pi-flag',
            command: () => {
              if(!this.currentUserId) {
                this.loginDialogService.show();
                return;
              }
              this.isVisibleReportAProblem = true;
            },
          },
          {
            label: this.translateService.instant('left_menu.about_us'),
            icon: 'pi pi-info-circle',
            route: '/about',
          }
        ],
      },
    ];

    if(this.currentUserId) {
      this.settingSubmenuItems[0].items.push({
        label: this.translateService.instant('left_menu.logout'),
        color: 'red',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        },
      });
    }
  }
  

  updateTheme() {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.settingSubmenuItems[0].items[0] = {
      label: this.currentTheme === 'theme-light' ? this.translateService.instant('left_menu.dark_mode') : this.translateService.instant('left_menu.light_mode'),
      icon: 'pi ' + (this.currentTheme === 'theme-light' ? 'pi-moon' : 'pi-sun'),
      command: () => {
        this.themeService.switchTheme(this.currentTheme === 'theme-light' ? 'theme-dark' : 'theme-light');
        this.updateTheme()
      },
    }
    this.settingSubmenuItems = [...this.settingSubmenuItems];
  }


  onMenuClick(menu: any): void {
    switch(menu.id) {
      case 'SearchButton':
        this.toggleSearch();
        break;
      case 'NotificationsButton':
        this.toggleNotifications();
        break;
      case 'MessagesButton':
        this.onMessagesClick();
        break;
      default:
        this.closeSearchAndNotifications();
        break;
    }
  }


  onCreateClick() {
    if(!this.currentUserId) {
      this.loginDialogService.show();
      return;
    }
    else this.createPostComponent.showDialog();
  }


  onCreateStoryClick() {
    if(!this.currentUserId) {
      this.loginDialogService.show();
      return;
    }
    else this.router.navigate(['/story/create']);
  }


  onMessagesClick(): void {
    this.closeSearchAndNotifications();
    if(!this.currentUserId) {
      this.loginDialogService.show();
      return;
    }
    else this.router.navigate(['/messages']);
  }


  toggleNotifications(): void {
    if(!this.currentUserId) {
      this.loginDialogService.show();
      return;
    }
    else this.actionToggle.emit({ type: 'notifications', state: 'toggle' });
  }


  toggleSearch(): void {
    this.actionToggle.emit({ type: 'search', state: 'toggle' });
  }


  closeSearchAndNotifications(): void {
    this.actionToggle.emit({ type: 'search', state: 'close' });
    this.actionToggle.emit({ type: 'notifications', state: 'close' });
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
