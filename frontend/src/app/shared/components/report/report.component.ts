import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { Post } from 'src/app/core/interfaces/post';
import { Report } from 'src/app/core/interfaces/report';
import { PostService } from 'src/app/core/services/post.service';
import { ReportService } from 'src/app/core/services/report.service';
import { ToastService } from 'src/app/core/services/toast.service';
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
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reason: [null, Validators.required],
      description: [],
    });

    this.reasons = [
      { label: 'SPAM', value: 'SPAM' },
      { label: 'HARASSMENT', value: 'HARASSMENT' },
      { label: 'VIOLENCE', value: 'VIOLENCE' },
      { label: 'INAPPROPRIATE CONTENT', value: 'INAPPROPRIATE_CONTENT' },
      // { label: 'NUDE', value : 'NUDE'}
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
        // userId: this.userService.getUserResponseFromLocalStorage()?.id,
        userId : "5f8dfe06-774f-484b-90cf-ceed1f705b70",
        reason: this.reportForm?.value.reason.value,
        description: this.reportForm?.value.description,
      };

      this.reportService.createReport(report).subscribe(
        (response) => {
          this.toastService.showSuccess('success', 'Thank you for your feedback');
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
