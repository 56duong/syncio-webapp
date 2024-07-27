import { Component, EventEmitter, Output } from '@angular/core';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-mobile-bottom-menu',
  templateUrl: './mobile-bottom-menu.component.html',
  styleUrls: ['./mobile-bottom-menu.component.scss']
})

export class MobileBottomMenuComponent {
  @Output() actionToggle = new EventEmitter<string>();
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
      routerLink: 'messages',
      id: 'MessagesButton',
    },
    {
      icon: 'pi pi-heart',
      id: 'NotificationsButton',
    },
  ];

  constructor(
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    this.currentUsername = this.tokenService.extractUsernameFromToken();
  }

  toggleSearch(): void {
    this.actionToggle.emit('search');
  }

  toggleNotifications(): void {
    this.actionToggle.emit('notifications');
  }

}
