import { Component } from '@angular/core';
import { RedirectService } from 'src/app/core/services/redirect.service';

@Component({
  selector: 'app-update-ip',
  templateUrl: './update-ip.component.html',
  styleUrls: ['./update-ip.component.scss']
})

export class UpdateIpComponent {
  newIp: string = '';

  constructor(
    private redirectService: RedirectService,
  ) {}

  updateIp(): void {
    const newUrl = `http://${this.newIp}/`;
    window.localStorage.setItem('apiUrl', newUrl);
    alert(`API URL updated to: ${newUrl}`);
    this.redirectService.redirectAndReload('/');
  }
}
