import { Component } from '@angular/core';

@Component({
  selector: 'app-update-ip',
  templateUrl: './update-ip.component.html',
  styleUrls: ['./update-ip.component.scss']
})

export class UpdateIpComponent {
  newIp: string = '';

  constructor() {}

  updateIp(): void {
    const newUrl = `http://${this.newIp}:8080/`;
    window.localStorage.setItem('apiUrl', newUrl);
    alert(`API URL updated to: ${newUrl}`);
    window.location.href = '/';
  }
}
