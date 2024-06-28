import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { tap } from 'rxjs';
import { Post } from 'src/app/core/interfaces/post';
import { Report } from 'src/app/core/interfaces/report';
import { ReportService } from 'src/app/core/services/report.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TextUtils } from 'src/app/core/utils/text-utils';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})

export class PostComponent {
  @Input() post: Post = {};
  @Input() isReportedPostsPage: boolean = false;
  @Input() isHiddenPostsPage: boolean = false;
  @Output() deleteReportsEvent = new EventEmitter<string>();
  reports: Report[] = [];
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
  
  reasonDialogVisible: boolean = false;

  @Output() hidePostEvent = new EventEmitter<string>();
  @Output() activePostEvent = new EventEmitter<string>();

  reasonCounts: { [key: string]: number } = {
    'SPAM': 0,
    'HARASSMENT': 0,
    'VIOLENCE': 0,
    'INAPPROPRIATE_CONTENT': 0,
    'NUDE': 0
  };

  constructor(
    private location: Location,
    private textUtils: TextUtils,
    private toastService: ToastService,
    private reportService: ReportService
  ) {}

  hideDialog() {
    this.dialogVisible = false;
  }
  ngOnInit(): void {
    if (this.isReportedPostsPage) {
      this.getReports();
    }
  }

  getReports(): void {
    if (this.post.id) {
      console.log('Post ID:', this.post.id);
      this.reportService.getReportsByPostId(this.post.id).pipe(
        tap(reports => this.reports = reports),
        tap(reports => this.countReasons(reports))
      ).subscribe(
        () => {
          console.log('Reason Counts:', this.reasonCounts);
        },
        (error) => {
          console.log(error);
        }
      );
    }
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

  onActivePost(): void {
    this.activePostEvent.emit(this.post.id);
  }

  showReasonCountsDialog() {
    this.reasonDialogVisible = true;
  }

  hideReasonCountsDialog() {
    this.reasonDialogVisible = false;
  }

  deleteReport(): void {
    if (confirm('Are you sure you want to delete all reports for this post?')) {
      this.deleteReportsEvent.emit(this.post.id);
    }
  }

  // Count specific reasons in the reports of a post
  countReasons(reports: Report[]): void {
    // Reset the counts
    this.reasonCounts = {
      'SPAM': 0,
      'HARASSMENT': 0,
      'VIOLENCE': 0,
      'INAPPROPRIATE_CONTENT': 0
    };

    for (const report of reports) {
      const reason = report.reason;
      if (this.reasonCounts.hasOwnProperty(reason)) {
        this.reasonCounts[reason] += 1;
      }
    }
  }

  reasonKeys(): string[] {
    return Object.keys(this.reasonCounts);
  }

  onHidePost(): void {
    this.hidePostEvent.emit(this.post.id);
  }

}
