import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-privacy-security-reporting',
  templateUrl: './privacy-security-reporting.component.html',
  styleUrls: ['./privacy-security-reporting.component.scss']
})
export class PrivacySecurityReportingComponent {
  @Input() selectedMenuItem!: string;
  @Input() selectedSubMenuItem!: string;
  @Input() selectedSubSubMenuItem!: string;

  visibleContentLabels: string[] = [];

  loginPasswordsItems: { [key: string]: { label: string, content: string, icon: string }[] } = {
    'cant-log-in': [
      {
        label: 'Reset Your Password',
        content: `
          <p>To reset your password:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Go to the login page and click on <strong>Forgot password?</strong>.</li>
            <li class="mt-2">Enter your email address and click <strong>Submit</strong>.</li>
            <li class="mt-2">Check your email for the password reset link and follow the instructions.</li>
          </ol>
        `,
        icon: 'pi pi-lock font-bold mx-2',
      }
    ],
    'hacked-account': [
      {
        label: 'Report Hacked Account',
        content: `
          <p>If you believe your account has been hacked:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Go to the <a href="https://help.syncio.com">Help Center</a> and navigate to the hacked accounts section.</li>
            <li class="mt-2">Follow the instructions provided to secure your account.</li>
          </ol>
        `,
        icon: 'pi pi-exclamation-circle font-bold mx-2',
      }
    ],
    'keep-account-secure': [
      {
        label: 'Tips for Security',
        content: `
          <p>To keep your account secure:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Use a strong and unique password for your account.</li>
            <li class="mt-2">Enable two-factor authentication.</li>
            <li class="mt-2">Be cautious of suspicious links and messages.</li>
          </ol>
        `,
        icon: 'pi pi-shield font-bold mx-2',
      }
    ],
    'syncio-web': [
      {
        label: 'Using Syncio on the Web',
        content: `
          <p>To use Syncio on the web:</p>
          <ol style="list-style-type: decimal;">
            <li class="mt-2">Visit <a href="https://www.syncio.com">www.syncio.com</a> and log in with your credentials.</li>
            <li class="mt-2">Navigate through your feed, explore, and interact with posts.</li>
          </ol>
        `,
        icon: 'pi pi-globe font-bold mx-2',
      }
    ]
  };

  reportThingsItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Report a Post',
      content: `
        <p>To report a post:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Click on the three dots above the post you want to report.</li>
          <li class="mt-2">Select <strong>Report</strong> from the dropdown menu.</li>
          <li class="mt-2">Follow the on-screen instructions to complete the report.</li>
        </ol>
      `,
      icon: 'pi pi-flag font-bold mx-2',
    }
  ];

  impersonationAccountsItems: { label: string, content: string, icon: string }[] = [
    {
      label: 'Report Impersonation',
      content: `
        <p>To report an impersonation account:</p>
        <ol style="list-style-type: decimal;">
          <li class="mt-2">Go to the profile of the account impersonating you.</li>
          <li class="mt-2">Click on the three dots on the top right corner of the profile.</li>
          <li class="mt-2">Select <strong>Report</strong> and follow the on-screen instructions.</li>
        </ol>
      `,
      icon: 'pi pi-users font-bold mx-2',
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

  getSubSubMenuTitle(subSubMenuItem: string): string {
    const titles: { [key: string]: string } = {
      'cant-log-in': 'I Can\'t Log In',
      'hacked-account': 'Hacked Syncio Account',
      'keep-account-secure': 'How to keep your Syncio account secure',
      'syncio-web': 'Syncio on the Web'
    };
    return titles[subSubMenuItem] || '';
  }
}
