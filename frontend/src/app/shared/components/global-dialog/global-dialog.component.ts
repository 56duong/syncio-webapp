import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-global-dialog',
  templateUrl: './global-dialog.component.html',
  styleUrls: ['./global-dialog.component.scss']
})

export class GlobalDialogComponent {
  @Input() display: boolean = false;
  @Input() items: any[] = [];
  @Output() displayChange = new EventEmitter<void>();

  onItemClick(item: DialogItem) {
    if (item && item.action) {
      item.action();
    }
    this.display = false; 
  }

  onHide() {
    this.displayChange.emit();
  }
}

interface DialogItem {
  label?: string;
  icon?: string;
  color?: string;
  action?: () => void;
}
