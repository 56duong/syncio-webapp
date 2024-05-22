import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})

export class PostDetailComponent {
  
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  
  closeDialog() {
    this.visibleChange.emit(false);
  }
}
