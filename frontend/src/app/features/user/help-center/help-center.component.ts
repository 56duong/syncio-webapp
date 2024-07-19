import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent implements OnInit {
  selectedMenuItem!: string;
  selectedSubMenuItem!: string;
  selectedSubSubMenuItem!: string;

  ngOnInit() {
    // Initialize with default values if needed
  }

  onMenuItemSelected(event: {menuItem: string, subMenuItem?: string, subSubMenuItem?: string}) {
    this.selectedMenuItem = event.menuItem;
    this.selectedSubMenuItem = event.subMenuItem || '';
    this.selectedSubSubMenuItem = event.subSubMenuItem || '';

    console.log('Selected sub sub menu item:', this.selectedSubSubMenuItem);
    
  }
}