import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoginDialogService } from 'src/app/core/services/login-dialog.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-mobile-bottom-menu',
  templateUrl: './mobile-bottom-menu.component.html',
  styleUrls: ['./mobile-bottom-menu.component.scss']
})

export class MobileBottomMenuComponent {
  @Output() actionToggle = new EventEmitter<any>();
  currentUserId: string = '';
  currentUsername: string = '';
  menus = [
    {
      icon: 'pi pi-home',
      routerLink: '/',
      id: 'HomeButton',
    },
    {
      icon: 'pi pi-search',
      id: 'SearchButton',
    },
    {
      icon: 'pi pi-comments',
      id: 'MessagesButton',
    },
    {
      icon: 'pi pi-heart',
      id: 'NotificationsButton',
    },
  ];

  constructor(
    private tokenService: TokenService,
    private loginDialogService: LoginDialogService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    this.currentUsername = this.tokenService.extractUsernameFromToken();
  }


  toggleSearch(): void {
    this.actionToggle.emit({ type: 'search', state: 'toggle' });
  }


  toggleNotifications(): void {
    if(!this.currentUserId) {
      this.loginDialogService.show();
      return;
    }
    this.actionToggle.emit({ type: 'notifications', state: 'toggle' });
  }


  closeSearchAndNotifications(): void {
    this.actionToggle.emit({ type: 'search', state: 'close' });
    this.actionToggle.emit({ type: 'notifications', state: 'close' });
  }


  onMessagesClick(): void {
    this.closeSearchAndNotifications();
    if(!this.currentUserId) {
      this.loginDialogService.show();
      return;
    }
    else this.router.navigate(['/messages']);
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

}
