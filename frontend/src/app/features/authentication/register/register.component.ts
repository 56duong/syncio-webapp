import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from '../login/user.response';
import { RegisterDTO } from './register.dto';
import { ToastService } from 'src/app/core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/core/services/lang.service';

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
    private langService: LangService
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
    window.location.reload();
  }

  register() {
    let errorText = this.translateService.instant('error');
    let successText = this.translateService.instant('success');

    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //validate email
    if (!emailRegex.test(this.email)) {
      if (!this.email.includes('@')) {
        this.toastService.showError(errorText, this.translateService.instant('emailShouldContain'));
        return;
      }
      if (!this.email.includes('.')) {
        this.toastService.showError(errorText, this.translateService.instant('emailShouldContainADot'));
        return;
      }
      this.toastService.showError(errorText, this.translateService.instant('emailInvalid'));
      return;
    }

    //validate username
    if (!usernameRegex.test(this.username)) {
      if (/[^a-zA-Z0-9]/.test(this.username)) {
        this.toastService.showError(errorText, this.translateService.instant('usernameOnlyContain'));
        return;
      }
      if (this.username.length < 3 || this.username.length > 50) {
        this.toastService.showError(errorText, this.translateService.instant('usernameShouldBeAtLeast3CharactersAndAtMost30Characters'));
        return;
      }
    }
    
    this.isLoading = true;

    const registerDTO: RegisterDTO = {
      username: this.username,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
    };

    if (this.password.length < 6 || this.password.length > 100) {
      this.toastService.showError(errorText, this.translateService.instant('passwordShouldBeAtLeast6CharactersAndAtMost100Characters'));
      this.isLoading = false;
      return;
    }

    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        if (response.status === 'CREATED') {
          this.toastService.showSuccess(successText, response.message);
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