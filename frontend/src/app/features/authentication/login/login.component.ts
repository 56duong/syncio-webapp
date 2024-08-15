import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserResponse } from './user.response';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { LoginDTO } from './login.dto';
import { LoginResponse } from './login.response';
import { RegisterDTO } from '../register/register.dto';
import { MessageService } from 'primeng/api';
import { TokenService } from 'src/app/core/services/token.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/core/services/lang.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { RedirectService } from 'src/app/core/services/redirect.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})

export class LoginComponent implements OnInit {
  @ViewChild('loginForm') loginForm!: NgForm;
  isActive = false;
  display: boolean = false;

  // other methods

  hideDialog() {
    this.display = false;
  }

  activate() {
    this.isActive = true;
    this.emailOrUsername = '';
    this.password = '';
  }

  deactivate() {
    this.isActive = false;
    this.emailOrUsername = '';
    this.password = '';
  }
  username: string = '';
  emailOrUsername: string = '';
  password: string = '';
  retypePassword: string = '';
  showPassword: boolean = false;
  roles: string[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: string | undefined; // Biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse;

  onEmailChange() {}
  constructor(
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    public langService: LangService,
    private loadingService: LoadingService,
    private redirectService: RedirectService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.confirmRegistration(token);
      }

      let message = params['message'];
      let type = params['type'];
      if (message) {
        let errorText = this.translateService.instant('common.error');
        switch (type) {
          case 'success':
            this.toastService.showSuccess('Success', message);
            break;
          case 'error':
            this.toastService.showError(errorText, message);
            break;
          case 'info':
            this.toastService.showInfo('Info', message);
            break;
          case 'warn':
            this.toastService.showWarn('Warning', message);
            break;
          default:
            this.toastService.showInfo('Info', message);
        }
      }
    });
  }

  switchLang(lang: string) {
    this.langService.setLang(lang);
    this.redirectService.reloadPage('/login');
  }

  createAccount() {
    this.redirectService.redirectAndReload('/register');
  }
  navigateToForgotPassword() {
    this.redirectService.redirectAndReload('/forgot_password');
  }

  login() {
    console.log('login', this.emailOrUsername);
    let errorText = this.translateService.instant('common.error');
    if (this.emailOrUsername == null || this.emailOrUsername == '') {
      this.toastService.showError(errorText, this.translateService.instant('login.email_is_required'));
      return;
    }
    if (this.password == null || this.password == '') {
      this.toastService.showError(errorText, this.translateService.instant('login.password_is_required'));
      return;
    }
    
    const loginDTO: LoginDTO = {
      emailOrUsername: this.emailOrUsername,
      password: this.password,
    };

    this.loadingService.show();

    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        const { token, refresh_token } = response.data;
        this.tokenService.setToken(token);

        this.userService.getUserDetail(token).subscribe({
          next: (response: any) => {
            this.loadingService.hide();

            this.userResponse = {
              ...response,
            };

            this.userService.saveUserResponseToLocalStorage(this.userResponse);
            if (this.userResponse?.role == 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (this.userResponse?.role == 'USER') {
              this.redirectService.redirectAndReload('/');
              // this.router.navigate(['/']);
              // window.location.href = '/';
            }
          },
          complete: () => {},
          error: (error: any) => {
            console.log('error', error);
            this.loadingService.hide();
            let errorMessage = '';
            if(error.error.subErrors) {
              const subErrors = error.error.subErrors;
              subErrors.forEach((subError: any) => {
                errorMessage += subError.message + '\n';
              });
            }
            else {
              errorMessage = error.error.message;
            }
            this.toastService.showError(errorText, errorMessage);
          },
        });
      },
      complete: () => {},
      error: (error: any) => {
        console.log('error', error);
        this.loadingService.hide();
        let errorMessage = '';
        if(error.error.subErrors) {
          const subErrors = error.error.subErrors;
          subErrors.forEach((subError: any) => {
            errorMessage += subError.message + '\n';
          });
        }
        else {
          errorMessage = error.error.message;
        }
        this.toastService.showError(errorText, errorMessage);
      },
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  register() {
    const usernameRegex = /^[a-zA-Z0-9]{3,30}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!usernameRegex.test(this.username)) {
      if (/[^a-zA-Z0-9]/.test(this.username)) {
        this.toastService.showError('Error', 'Username should not contain special characters.');
        return;
      }
      if (this.username.length < 3 || this.username.length > 50) {
        this.toastService.showError('Error', 'Username should contain 3 to 50 alphanumeric characters.');
        return;
      }
    }

    //validate email
    if (!emailRegex.test(this.emailOrUsername)) {
      if (!this.emailOrUsername.includes('@')) {
        this.toastService.showError('Error', 'Email should contain an "@" symbol.');
        return;
      }
      if (!this.emailOrUsername.includes('.')) {
        this.toastService.showError('Error', 'Email should contain a domain name with a "."');
        return;
      }
      this.toastService.showError('Error', 'Email is invalid.');
      return;
    }
    const registerDTO: RegisterDTO = {
      username: this.username,
      email: this.emailOrUsername,

      password: this.password,
      retype_password: this.retypePassword,
    };
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        if (response.status === 'CREATED') {
          this.deactivate();
          this.toastService.showSuccess('Success', response.message);
        }
      },
      complete: () => {},
      error: (error: any) => {
        this.toastService.showError('Error', error.error.message);
      },
    });
  }

  confirmRegistration(token: string): void {
    this.userService.confirmUserRegister(token).subscribe({
      next: (response: any) => {
        console.log('Registration confirmed:', response);
        this.toastService.showSuccess(this.translateService.instant('common.success'), response.message);
      },
      complete: () => {},
      error: (error: any) => {
        this.toastService.showError('Error', error.error.message);
      },
    });
  }
}