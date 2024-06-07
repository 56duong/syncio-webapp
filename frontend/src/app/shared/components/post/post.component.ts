import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map, tap } from 'rxjs';
import { Post } from 'src/app/core/interfaces/post';
import { Report } from 'src/app/core/interfaces/report';
import { ReportService } from 'src/app/core/services/report.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit{
  @Input() post: Post = {};
  @Input() isReportedPostsPage: boolean = false;
  @Input() isHiddenPostsPage: boolean = false;
  reports: Report[] = [];
  visible: boolean = false; // Used to show/hide the post detail modal
  reportVisible: boolean = false; // Used to show/hide the report modal

  @Output() hidePostEvent = new EventEmitter<string>();
  @Output() activePostEvent = new EventEmitter<string>();
  mostFrequentReason: string | null = null; // Variable to hold the most frequent reason

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    if (this.isReportedPostsPage) {
      this.getReports();
    }
  }

  getReports(): void {
    if (this.post.id) {
      this.reportService.getReportsByPostId(this.post.id).pipe(
        tap(reports => this.reports = reports),
        map(reports => this.findMostFrequentReason(reports))
      ).subscribe(
        (mostFrequentReason) => {
          this.mostFrequentReason = mostFrequentReason;
          console.log('Most Frequent Reason:', mostFrequentReason);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  // get the most frequent reason reports of a post
  findMostFrequentReason(reports: Report[]): string | null {
    if (!reports.length) return null;

    const reasonCount: { [key: string]: number } = {};
    let maxCount = 0;
    let mostFrequentReason = null;

    for (const report of reports) {
      const reason = report.reason;
      reasonCount[reason] = (reasonCount[reason] || 0) + 1;

      if (reasonCount[reason] > maxCount) {
        maxCount = reasonCount[reason];
        mostFrequentReason = reason;
      }
    }

    return mostFrequentReason;
    
  }
  showPostDetail(event: any) {
    this.visible = event;
  }

  showReportModal() {
    this.reportVisible = true;
  }

  handleReportModalVisibility(event: boolean) {
    this.reportVisible = event; 
  }

  onHidePost(): void {
    this.hidePostEvent.emit(this.post.id);
  }

  onActivePost(): void {
    this.activePostEvent.emit(this.post.id);
  }
}
