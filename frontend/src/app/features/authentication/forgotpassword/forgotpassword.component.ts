import { Component, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { FogotPasswordDTO } from './forgotpassword.dto';
import { NgForm } from '@angular/forms';
import { LangService } from 'src/app/core/services/lang.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss'],
})

export class ForgotpasswordComponent {

  @ViewChild('forgotpassword') forgotpassword!: NgForm;
  email: string = '';

  constructor(
    private langService: LangService,
    private redirectService: RedirectService,
    private userService: UserService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private loadingService: LoadingService
  ) {}


  switchLang(lang: string) {
    this.langService.setLang(lang);
    this.redirectService.reloadPage('/forgot_password');
  }


  sendPasswordToMail() {
    if (!this.email) {
      this.toastService.showError(
        this.translateService.instant('common.error'),
        this.translateService.instant('forgot_password.please_enter_your_email')
      );
      return;
    }

    this.loadingService.show();

    const fogotPasswordDTO: FogotPasswordDTO = {
      email: this.email,
    };

    this.userService.sendPasswordToMailSerive(fogotPasswordDTO).subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.showSuccess(
          this.translateService.instant('common.success'),
          this.translateService.instant('forgot_password.please_check_your_email_to_reset_your_password')
        );
      },
      error: (error: any) => {
        console.log(error);
        this.loadingService.hide();
        this.toastService.showError(
          this.translateService.instant('common.error'),
          error.error.message
        );
      },
    });
  }

}
