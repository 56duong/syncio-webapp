import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { Post } from 'src/app/core/interfaces/post';
import { Report } from 'src/app/core/interfaces/report';
import { PostService } from 'src/app/core/services/post.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {
  @Input() display: boolean = false;
  @Input() post!: Post;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter<boolean>();

  reportForm?: FormGroup;
  reasons: SelectItem[] = [];

  constructor(
    private userService: UserService,
    private reportService: ReportService, 
    private fb: FormBuilder,
    private translateService: TranslateService,
    private toastService: ToastService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reason: [null, Validators.required],
      description: [],
    });

    this.reasons = [
      { label: this.translateService.instant('report.spam'), value: 'SPAM' },
      { label: this.translateService.instant('report.nude'), value: 'NUDE' },
      { label: this.translateService.instant('report.harassment'), value: 'HARASSMENT' },
      { label: this.translateService.instant('report.violence'), value: 'VIOLENCE' },
      { label: this.translateService.instant('report.inappropriate_content'), value: 'INAPPROPRIATE_CONTENT' },
    ];
  }

  closeModal() {
    this.display = false;
    this.visibleChange.emit(false);
  }

  onSubmit() {
    if (this.reportForm?.valid) {
      const report: Report = {
        postId: this.post.id,
        userId: this.userService.getUserResponseFromLocalStorage()?.id,
        reason: this.reportForm?.value.reason.value,
        description: this.reportForm?.value.description,
      };

      this.reportService.createReport(report).subscribe(
        (response) => {
          this.toastService.showSuccess(
            this.translateService.instant('report.thanks_for_letting_us_know'),
            this.translateService.instant('report.your_feedback_is_important_in_helping_us_keep_the_community_safe')
          );
          console.log('Report submitted successfully:', report);
          // reset the form and close the modal after successful submission
          this.reportForm?.reset();
          this.closeModal();
        },
        (error) => {
          // Handle error
          console.error('Error submitting report:', error);
        }
      );
      this.closeModal();
    }
  }
}
