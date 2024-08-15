import { Location } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { tap } from 'rxjs';
import { Post, Visibility } from 'src/app/core/interfaces/post';
import { Report } from 'src/app/core/interfaces/report';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
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
  
  dialogItems: any = [];
  
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

  isViewMore: boolean = false;

  Visibility = Visibility

  collectionVisible: boolean = false;

  currentUserId: string = '';

  constructor(
    private location: Location,
    private textUtils: TextUtils,
    private toastService: ToastService,
    private reportService: ReportService,
    private translateService: TranslateService,
    private tokenService: TokenService,
    private redirectService: RedirectService,
    private router: Router
  ) {}

  hideDialog() {
    this.dialogVisible = false;
  }
  
  ngOnInit(): void {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    this.dialogItems = [
      { 
        label: this.translateService.instant('post.report'), 
        bold: 7,
        color: 'red', 
        action: () => this.showReportModal() 
      },
      { 
        label: this.translateService.instant('post.copy_link'),
        action: () => this.copyLink()
      },
      ...(this.post.createdBy === this.currentUserId ? [{ 
        label: this.translateService.instant('post.save_to_collection'),
        action: () => this.collectionVisible = true
      }] : []),
      { 
        label: this.translateService.instant('common.cancel'),
        action: () => this.dialogVisible = false
      }
    ];

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
    if(!this.tokenService.extractUserIdFromToken()) {
      this.redirectService.needLogin();
    }
    else {
      this.reportVisible = true;
    }
  }

  handleReportModalVisibility(event: boolean) {
    this.reportVisible = event; // Update reportVisible based on the event emitted from ReportComponent
  }

  /**
   * Copy the link of the post to the clipboard
   */
  async copyLink() {
    await this.textUtils.copyToClipboard(window.location.href + 'post/' + this.post.id);
    this.toastService.showSuccess(
      this.translateService.instant('common.success'), 
      this.translateService.instant('post.link_copied_to_clipboard')
    );
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


  /**
   * Handle the click event on the post caption.
   * @param event 
   */
  handleClick(event: MouseEvent) {
    // Check if the click event target is a .profile-link element
    const target = event.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('data-link')) {
      event.preventDefault();
      const profileUrl = target.getAttribute('data-link');
      this.router.navigate([profileUrl]);
    }
  
    // Toggle isViewMore if not clicked on a .profile-link
    this.isViewMore = !this.isViewMore;
  }

}
