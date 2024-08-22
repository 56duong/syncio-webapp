import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { LangService } from 'src/app/core/services/lang.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-auth-email',
  templateUrl: './auth-email.component.html',
  styleUrls: ['./auth-email.component.scss'],
  providers: [MessageService],
})
export class AuthEmailComponent implements OnInit {
  email: string = '';
  isButtonDisabled: boolean = true; // Initially disable the button
  countdown: number = 60;

  constructor(
    private translateService: TranslateService,
    private redirectService: RedirectService,
    public langService: LangService,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
    });

    // Start the countdown as soon as the component is initialized
    this.startCountdown();
  }

  switchLang(lang: string) {
    this.langService.setLang(lang);
    this.redirectService.reloadPage('/auth-email');
  }

  sendEmail() {
    if (!this.email) {
      this.toastService.showError(
        this.translateService.instant('common.error'),
        this.translateService.instant('forgot_password.please_enter_your_email')
      );
      return;
    }
    this.isButtonDisabled = true;
    this.userService.resendRegistrationEmail(this.email).subscribe({
      next: () => {
        this.toastService.showSuccess(
          this.translateService.instant('common.success'),
          this.translateService.instant(
            'forgot_password.please_check_your_email_to_reset_your_password'
          )
        );

        this.countdown = 60;
        this.startCountdown();
      },
      error: (error: any) => {
        console.log(error);
        this.isButtonDisabled = false;
        this.toastService.showError(
          this.translateService.instant('common.error'),
          error.error.message
        );
      },
    });
  }

  private startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.isButtonDisabled = false;
        clearInterval(interval);
      }
    }, 1000);
  }
}
