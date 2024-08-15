import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GithubService } from 'src/app/core/services/github.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-user-report',
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.scss']
})

export class UserReportComponent {
  @Input() isVisibleReportAProblem: boolean = false;
  @Output() visibleChange: EventEmitter<any> = new EventEmitter<boolean>();

  /** Options for the user to select */
  options: any = [
    {
      value: 'bug',
      label: this.translateService.instant('user_report.report_a_bug')
    }, 
    {
      value: 'improve',
      label: this.translateService.instant('user_report.help_us_improve_syncio')
    }
  ];

  /** Selected option in the dialog */
  selectedOption: any = this.options[0];
  /** Label for the selected option */
  selectedOptionLabel: string = this.selectedOption.value === 'bug' ? this.translateService.instant('user_report.something_went_wrong') : this.translateService.instant('user_report.help_us_improve_syncio_by_providing_feedback');
  /** Title of the issue to be created */
  title: string = '';
  /** Details of the issue to be created */
  details: string = '';
  /** Files selected to be uploaded */
  selectedFiles: any = [];
  /** URLs of the selected files */
  selectedFilesUrl: any = [];

  constructor(
    private githubService: GithubService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private translateService: TranslateService,
  ) { }


  onOptionChange(event: any) {
    this.selectedOption = event;
    this.selectedOptionLabel = this.selectedOption.value === 'bug' ? this.translateService.instant('user_report.something_went_wrong') : this.translateService.instant('user_report.help_us_improve_syncio_by_providing_feedback');
  }


  onFileSelected(event: any) {
    if (event.target.files) {
      if(event.target.files.length > 6) {
        alert(this.translateService.instant('user_report.you_can_upload_up_to_6_images'));
        return;
      }

      this.selectedFiles = event.target.files;
      this.selectedFilesUrl = Array.from(this.selectedFiles).map((file: any) => URL.createObjectURL(file));
    }
  }


  async onSubmit() {
    if(!this.selectedOption || !this.details || !this.title) return;

    this.loadingService.show();
    
    let imageUrls: string[] = [];
    // Upload images
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      try {
        imageUrls = await this.githubService.uploadImage(this.selectedFiles, this.selectedOption.value);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    
    // Create issue
    await this.githubService.createIssue(this.title, this.details, this.selectedOption.value, imageUrls);
    
    this.toastService.showSuccess(
      this.translateService.instant('common.success'), 
      this.selectedOption.value === 'bug' ? this.translateService.instant('user_report.thank_you_for_reporting_the_bug_we_will_look_into_it') : this.translateService.instant('user_report.thank_you_for_your_feedback_we_will_use_it_to_improve_syncio'));

    // Reset form
    this.selectedOption = this.options[0];
    this.selectedOptionLabel = this.selectedOption.value === 'bug' ? this.translateService.instant('user_report.something_went_wrong') : this.translateService.instant('user_report.help_us_improve_syncio_by_providing_feedback');
    this.title = '';
    this.details = '';
    this.selectedFiles = [];
    this.selectedFilesUrl = [];
    this.isVisibleReportAProblem = false;
    
    this.loadingService.hide();
  }

}
