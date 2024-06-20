import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      detail: message,
    });
  }

  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      detail: message,
    });
  }
}
