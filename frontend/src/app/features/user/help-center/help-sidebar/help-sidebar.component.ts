import { Component, EventEmitter, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-help-sidebar',
  templateUrl: './help-sidebar.component.html',
  styleUrls: ['./help-sidebar.component.scss']
})
export class HelpSidebarComponent {
  @Output() menuItemSelected = new EventEmitter<{menuItem: string, subMenuItem?: string, subSubMenuItem?: string}>();

  items: MenuItem[] = [
    {
      label: 'Instagram Features',
      icon: 'pi pi-fw pi-star',
      items: [
        {
          label: 'Your Profile',
          icon: 'pi pi-fw pi-user',
          items: [
            {
              label: 'Photos and Videos You\'re Tagged In',
              command: () => this.menuItemSelected.emit({menuItem: 'instagram-features', subMenuItem: 'your-profile', subSubMenuItem: 'photos-tagged'})
            },
            {
              label: 'Editing Your Profile',
              command: () => this.menuItemSelected.emit({menuItem: 'instagram-features', subMenuItem: 'your-profile', subSubMenuItem: 'editing-profile'})
            }
          ]
        },
        {
          label: 'Exploring Picture',
          icon: 'pi pi-fw pi-image',
          items: [
            {
              label: 'Search and Explore',
              command: () => this.menuItemSelected.emit({menuItem: 'instagram-features', subMenuItem: 'exploring-picture', subSubMenuItem: 'search-explore'})
            }
          ]
        },
        {
          label: 'Messaging',
          icon: 'pi pi-fw pi-comments',
          items: [
            {
              label: 'Send, View and Manage Messages',
              command: () => this.menuItemSelected.emit({menuItem: 'instagram-features', subMenuItem: 'messaging', subSubMenuItem: 'send-view-manage'})
            },
            {
              label: 'Group Chat',
              command: () => this.menuItemSelected.emit({menuItem: 'instagram-features', subMenuItem: 'messaging', subSubMenuItem: 'group-chat'})
            }
          ]
        }
      ]
    },
    {
      label: 'Manage Your Account',
      icon: 'pi pi-fw pi-cog',
      items: [
        {
          label: 'Signing Up and Getting Started',
          icon: 'pi pi-fw pi-user-plus',
          items: [
            {
              label: 'Change Your Account Information',
              command: () => this.menuItemSelected.emit({menuItem: 'account-settings', subMenuItem: 'creating-account-username', subSubMenuItem: 'change-info'})
            },
            {
              label: 'Navigating the App',
              command: () => this.menuItemSelected.emit({menuItem: 'account-settings', subMenuItem: 'creating-account-username', subSubMenuItem: 'navigating-the-app'})
            }
          ]
        },
        {
          label: 'Login and Password',
          icon: 'pi pi-fw pi-key',
          command: () => this.menuItemSelected.emit({menuItem: 'account-settings', subMenuItem: 'login-password'})
        },
        {
          label: 'Privacy and Security',
          icon: 'pi pi-fw pi-lock',
          command: () => this.menuItemSelected.emit({menuItem: 'account-settings', subMenuItem: 'privacy-security'})
        },
        {
          label: 'Notifications',
          icon: 'pi pi-fw pi-bell',
          command: () => this.menuItemSelected.emit({menuItem: 'account-settings', subMenuItem: 'notifications'})
        }
      ]
    },
    {
      label: 'Privacy, Security and Reporting',
      icon: 'pi pi-fw pi-shield',
      items: [
        {
          label: 'Login and Passwords',
          icon: 'pi pi-fw pi-key',
          items: [
            {
              label: 'I Can\'t Log In',
              command: () => this.menuItemSelected.emit({menuItem: 'privacy-security-reporting', subMenuItem: 'login-passwords', subSubMenuItem: 'cant-log-in'})
            },
            {
              label: 'Hacked Syncio Account',
              command: () => this.menuItemSelected.emit({menuItem: 'privacy-security-reporting', subMenuItem: 'login-passwords', subSubMenuItem: 'hacked-account'})
            },
            {
              label: 'How to keep your Syncio account secure',
              command: () => this.menuItemSelected.emit({menuItem: 'privacy-security-reporting', subMenuItem: 'login-passwords', subSubMenuItem: 'keep-account-secure'})
            },
            {
              label: 'Syncio on the Web',
              command: () => this.menuItemSelected.emit({menuItem: 'privacy-security-reporting', subMenuItem: 'login-passwords', subSubMenuItem: 'syncio-web'})
            }
          ]
        },
        {
          label: 'How to Report Things',
          icon: 'pi pi-fw pi-flag',
          command: () => this.menuItemSelected.emit({menuItem: 'privacy-security-reporting', subMenuItem: 'report-things'})
        },
        {
          label: 'Impersonation Accounts',
          icon: 'pi pi-fw pi-users',
          command: () => this.menuItemSelected.emit({menuItem: 'privacy-security-reporting', subMenuItem: 'impersonation-accounts'})
        }
      ]
    },
  ];
}
