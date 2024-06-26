import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Post } from 'src/app/core/interfaces/post';
import { ToastService } from 'src/app/core/services/toast.service';
import { TextUtils } from 'src/app/core/utils/text-utils';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})

export class PostComponent {
  @Input() post: Post = {};
  
  visible: boolean = false; // Used to show/hide the post detail modal
  reportVisible: boolean = false; // Used to show/hide the report modal
  
  dialogVisible: boolean = false;
  dialogItems: any = [
    { 
      label: 'Report', 
      // icon: 'pi pi-check', 
      color: 'red', 
      action: () => this.showReportModal() 
    },
    { 
      label: 'Copy link',
      action: () => this.copyLink()
    },
    { 
      label: 'Cancel',
      action: () => this.dialogVisible = false
    }
  ];

  constructor(
    private location: Location,
    private textUtils: TextUtils,
    private toastService: ToastService
  ) {}

  hideDialog() {
    this.dialogVisible = false;
  }

  showPostDetail(event: any) {
    this.visible = event;
    this.location.replaceState('/post/' + this.post.id);
  }

  showReportModal() {
    this.reportVisible = true;
  }

  handleReportModalVisibility(event: boolean) {
    this.reportVisible = event; // Update reportVisible based on the event emitted from ReportComponent
  }

  async copyLink() {
    await this.textUtils.copyToClipboard(window.location.href + 'post/' + this.post.id);
    this.toastService.showSuccess('Success', 'Link copied to clipboard');
  }

}
