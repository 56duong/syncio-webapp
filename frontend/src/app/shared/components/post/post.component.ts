import { Component, Input } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})

export class PostComponent {
  @Input() post: Post = {};
  
  visible: boolean = false; // Used to show/hide the post detail modal
  reportVisible: boolean = false; // Used to show/hide the report modal

  showPostDetail(event: any) {
    this.visible = event;
  }

  showReportModal() {
    this.reportVisible = true;
  }

  handleReportModalVisibility(event: boolean) {
    this.reportVisible = event; // Update reportVisible based on the event emitted from ReportComponent
  }

}
