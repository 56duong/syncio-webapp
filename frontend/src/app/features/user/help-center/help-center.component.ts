import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-center',
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent implements OnInit {
  isMobile = false;
  selectedMenuItem!: string;
  selectedSubMenuItem!: string;
  selectedSubSubMenuItem!: string;

  constructor() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit() {
    // Initialize with default values if needed
  }

  onMenuItemSelected(event: {menuItem: string, subMenuItem?: string, subSubMenuItem?: string}) {
    this.selectedMenuItem = event.menuItem;
    this.selectedSubMenuItem = event.subMenuItem || '';
    this.selectedSubSubMenuItem = event.subSubMenuItem || '';
    
  }
}