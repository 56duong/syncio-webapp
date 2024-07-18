import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-account-setting',
  templateUrl: './account-setting.component.html',
  styleUrls: ['./account-setting.component.scss']
})
export class AccountSettingComponent {
  @Input() selectedMenuItem!: string;
  @Input() selectedSubMenuItem!: string;
  @Input() selectedSubSubMenuItem!: string;

  visibleContentLabels: string[] = [];

  changeAccountInfoItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Create an Syncio account',
      content: `
        <p class="text-center">Note: you must be at least 13 years old to create an Instagram account.</p>
       <p>There are two ways to create an Instagram account. You can create a new account from the Instagram app or Instagram.com. If you already have an existing Facebook or Instagram account, you can use your existing account to create a new Instagram account. Both accounts will be added to the same Accounts Centre and have access to connected experiences.</p>
      `,
      icon: 'pi pi-user-edit font-bold mx-2',
    },
    {
      label: 'Update Username',
      content: `
        <p>To update your username:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-user-edit mx-1" style="font-size: 1rem"></i> <strong>Edit Profile</strong>.</li>
          <li class="mt-2">Enter your new username and click <strong>Save</strong>.</li>
        </ol>
      `,
      icon: 'pi pi-user-edit font-bold mx-2',
    },
    {
      label: 'Update Bio',
      content: `
        <p>To update your bio:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-info-circle mx-1" style="font-size: 1rem"></i> <strong>Edit Profile</strong>.</li>
          <li class="mt-2">Enter your new bio and click <strong>Save</strong>.</li>
        </ol>
      `,
      icon: 'pi pi-info-circle font-bold mx-2',
    }
  ];

  loginPasswordItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Change Password',
      content: `
        <p>To change your password:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-lock mx-1" style="font-size: 1rem"></i> <strong>Change Password</strong>.</li>
          <li class="mt-2">Enter your current password, followed by your new password.</li>
          <li class="mt-2">Click <strong>Save</strong> to apply the changes.</li>
        </ol>
      `,
      icon: 'pi pi-lock font-bold mx-2',
    },
    {
      label: 'Two-Factor Authentication',
      content: `
        <p>To enable two-factor authentication:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-shield mx-1" style="font-size: 1rem"></i> <strong>Security</strong>.</li>
          <li class="mt-2">Toggle the switch next to <strong>Two-Factor Authentication</strong> to enable it.</li>
          <li class="mt-2">Follow the on-screen instructions to set up your second factor.</li>
        </ol>
      `,
      icon: 'pi pi-shield font-bold mx-2',
    }
  ];

  privacySecurityItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Manage Privacy',
      content: `
        <p>To manage your privacy settings:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-eye mx-1" style="font-size: 1rem"></i> <strong>Privacy</strong>.</li>
          <li class="mt-2">Adjust your privacy settings as desired.</li>
          <li class="mt-2">Click <strong>Save</strong> to apply the changes.</li>
        </ol>
      `,
      icon: 'pi pi-eye font-bold mx-2',
    },
    {
      label: 'Security Tips',
      content: `
        <p>To view security tips:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-info-circle mx-1" style="font-size: 1rem"></i> <strong>Security</strong>.</li>
          <li class="mt-2">Browse through the security tips provided.</li>
        </ol>
      `,
      icon: 'pi pi-info-circle font-bold mx-2',
    }
  ];

  notificationsItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Email Notifications',
      content: `
        <p>To manage your email notifications:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-envelope mx-1" style="font-size: 1rem"></i> <strong>Email Notifications</strong>.</li>
          <li class="mt-2">Toggle the switches to enable or disable specific email notifications.</li>
        </ol>
      `,
      icon: 'pi pi-envelope font-bold mx-2',
    },
    {
      label: 'Push Notifications ',
      content: `
        <p>To manage your push notifications:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on your profile picture in the top right corner.</li>
          <li class="mt-2">Select <strong>Settings</strong> from the dropdown menu.</li>
          <li class="mt-2">Click <i class="pi pi-bell mx-1" style="font-size: 1rem"></i> <strong>Push Notifications</strong>.</li>
          <li class="mt-2">Toggle the switches to enable or disable specific push notifications.</li>
        </ol>
      `,
      icon: 'pi pi-bell  font-bold mx-2',
    }
  ];

  navigatingTheApp: { label: string, content: string, icon: string }[] = [
    {
      label: 'Login in to Syncio',
      content: `
        <p>
        This feature isn't available on Computer Help, but it is available on these devices. Select a device to learn more about this feature.
        </p>
      `,
      icon: 'pi pi-user-plus font-bold mx-2',
    },
    {
      label: 'Profile',
      content: `
        <p>
Profile shows your bio and Instagram posts. It's also where you can edit your profile info and adjust your account settings. </p>
      <p>Click your profile picture on the left to go to your profile. Learn more about your profile</p>
        
      `,
      icon: 'pi pi-user-edit font-bold mx-2',
    },
    {
      label: 'Search & Explore',
      content: `
        <p>You can find photos and videos that you might like from Instagram accounts that you don't yet follow in Explore. You may also see curated topics that you may enjoy.</p>
        <p>Click <i class="pi pi-compass mx-2"></i>on the left to find Explore. Learn more about Explore</p>
      `,
      icon: 'pi pi-compass font-bold mx-2',
    },
    {
      label: 'Home',
      content: `
        <p>Home shows you posts from people you follow. You can also see your own posts here.</p>`,
      icon: 'pi pi-home font-bold mx-2',
    }

  ];

  toggleContent(label: string) {
    const index = this.visibleContentLabels.indexOf(label);
    if (index === -1) {
      this.visibleContentLabels.push(label);
    } else {
      this.visibleContentLabels.splice(index, 1);
    }
  }

  isContentVisible(label: string): boolean {
    return this.visibleContentLabels.includes(label);
  }
}