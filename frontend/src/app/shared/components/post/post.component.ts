import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent {
  @Input() post: Post = {};

<<<<<<< HEAD
  visible: boolean = false;
  reportVisible: boolean = false;

  showPostDetail(event: any) {
    this.visible = event;
  }
  showReportModal() {
    this.reportVisible = true;
    console.log(this.reportVisible);
  }
  handleReportModalVisibility(event: boolean) {
    this.reportVisible = event; // Update reportVisible based on the event emitted from ReportComponent
=======
  showPostDetail(event: any) {
    this.visible = event;
>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63
  }
}
