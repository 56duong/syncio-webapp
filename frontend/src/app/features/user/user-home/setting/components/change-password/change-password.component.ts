import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from 'src/app/core/services/loading.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})

export class ChangePasswordComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';

  constructor(
    private userService: UserService,
    private redirectService: RedirectService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private loadingService: LoadingService,
    private tokenService: TokenService
  ) {}


  changePassword() {
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      return;
    }

    let errorText = this.translateService.instant('common.error');
    let successText = this.translateService.instant('common.success');

    // Password validation
    if (this.currentPassword.length < 6 || this.currentPassword.length > 100) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.current_password_should_be_at_least_6_characters_and_at_most_100_characters')
      );
      return;
    }
    if (this.newPassword.length < 6 || this.newPassword.length > 100) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.new_password_should_be_at_least_6_characters_and_at_most_100_characters')
      );
      return;
    }

    // Check if the password contains at least one letter
    if (!/[a-zA-Z!@#$%^&*(),.?":{}|<>]/.test(this.currentPassword)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.current_password_must_contain_letter_or_special_character')
      );
      return;
    }
    if (!/[a-zA-Z!@#$%^&*(),.?":{}|<>]/.test(this.newPassword)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.new_password_must_contain_letter_or_special_character')
      );
      return;
    }

    // Check if the password contains at least one number
    if (!/[0-9]/.test(this.currentPassword)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.current_password_must_contain_at_least_one_number')
      );
      return;
    }
    if (!/[0-9]/.test(this.newPassword)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.new_password_must_contain_at_least_one_number')
      );
      return;
    }

    // Check if the password contains space
    if (/\s/.test(this.currentPassword)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.current_password_must_not_contain_whitespace')
      );
      return;
    }
    if (/\s/.test(this.newPassword)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.new_password_must_not_contain_whitespace')
      );
      return;
    }

    // check match
    if (this.newPassword !== this.confirmNewPassword) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('change_password.new_passwords_do_not_match')
      );
      return;
    }

    this.loadingService.show();

    this.userService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.showSuccess(
          successText,
          this.translateService.instant('change_password.password_changed_successfully_will_be_auto_logged_out_in_5_seconds')
        );
        setTimeout(() => {
          this.logout();
          this.redirectService.redirectAndReload('/login');
        }, 5000);
      },
      error: (error: any) => {
        this.loadingService.hide();
        this.toastService.showError(errorText, error.error.message);
      },
    });
  }


  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.userService.removeUserFromLocalStorage();
        this.tokenService.removeToken();
        this.redirectService.redirectAndReload('/login');
      },
      error: (error) => {
        console.error(error);
      },
    });
  }


  navigateToForgotPassword() {
    this.redirectService.redirectAndReload('/forgot_password');
  }


  onSubmit() {
    this.changePassword();
  }

}
