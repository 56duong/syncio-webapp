import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from '../login/user.response';
import { RegisterDTO } from './register.dto';
import { ToastService } from 'src/app/core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/core/services/lang.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { PasswordValidationService } from 'src/app/core/services/password-validation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private langService: LangService,
    private redirectService: RedirectService,
    private passwordValidationService: PasswordValidationService,
    private router: Router
  ) {}

  isLoading: boolean = false;
  username: string = '';
  email: string = '';
  password: string = '';
  retypePassword: string = '';
  showPassword: boolean = false;
  roles: string[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: string | undefined; // Biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse;

  switchLang(lang: string) {
    this.langService.setLang(lang);
    this.redirectService.reloadPage('/register');
  }

  register() {
    let errorText = this.translateService.instant('common.error');
    let successText = this.translateService.instant('common.success');

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //validate email
    if (!emailRegex.test(this.email)) {
      if (!this.email.includes('@')) {
        this.toastService.showError(
          errorText,
          this.translateService.instant('register.email_should_contain_@')
        );
        return;
      }
      if (!this.email.includes('.')) {
        this.toastService.showError(
          errorText,
          this.translateService.instant('register.email_should_contain_a_dot')
        );
        return;
      }
      this.toastService.showError(
        errorText,
        this.translateService.instant('register.email_invalid')
      );
      return;
    }

    //validate username
    if (!usernameRegex.test(this.username)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('register.username_only_contain')
      );
      return;
    }

    if (this.username.length < 3 || this.username.length > 30) {
      this.toastService.showError(
        errorText,
        this.translateService.instant(
          'register.username_should_be_at_least_3_characters_and_at_most_30_characters'
        )
      );
      return;
    }

    // Password validation
    if (this.password.length < 6 || this.password.length > 100) {
      this.toastService.showError(
        errorText,
        this.translateService.instant(
          'register.password_should_be_at_least_6_characters_and_at_most_100_characters'
        )
      );
      return;
    }

    if (!/[a-z]/.test(this.password)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant(
          'Mật khẩu phải chứa ít nhất một chữ cái viết thường.'
        )
      );
      return;
    }

    if (!/[!@#$&*]/.test(this.password)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant(
          'Mật khẩu phải chứa ít nhất một ký tự đặc biệt (như !@#$&*).'
        )
      );
      return;
    }

    // Kiểm tra số lượng chữ cái viết thường, viết hoa, và số
    if (this.password.replace(/[^A-Z]/g, '').length < 1) {
      this.toastService.showError(
        errorText,
        this.translateService.instant(
          'Mật khẩu phải chứa ít nhất một chữ cái viết hoa.'
        )
      );
      return;
    }

    if (this.password.replace(/[^a-z]/g, '').length < 3) {
      this.toastService.showError(
        errorText,
        this.translateService.instant(
          'Mật khẩu phải chứa ít nhất ba chữ cái viết thường.'
        )
      );
      return;
    }

    if (this.password !== this.retypePassword) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('register.passwords_do_not_match')
      );
      return;
    }

    if (/\s/.test(this.password)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant('Mật khẩu không được chứa khoảng trắng.')
      );
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{6,}$/;

    if (!passwordRegex.test(this.password)) {
      this.toastService.showError(
        errorText,
        this.translateService.instant(
          'register.password_must_contain_at_least_one_letter_and_one_number'
        )
      );
      return;
    }
    this.isLoading = true;

    const registerDTO: RegisterDTO = {
      username: this.username,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
    };

    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        if (response.status === 'CREATED') {
          this.toastService.showSuccess(successText, response.message);
          this.router.navigate(['/auth-email'], {
            queryParams: { email: this.email },
          });
        }
        this.isLoading = false;
      },
      complete: () => {},
      error: (error: any) => {
        this.toastService.showError(errorText, error.error.message);
        this.isLoading = false;
      },
    });
  }
}
