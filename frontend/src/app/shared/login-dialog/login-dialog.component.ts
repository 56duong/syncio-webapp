import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from 'src/app/core/services/loading.service';
import { LoginDialogService } from 'src/app/core/services/login-dialog.service';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoginDTO } from 'src/app/features/authentication/login/login.dto';
import { LoginResponse } from 'src/app/features/authentication/login/login.response';
import { UserResponse } from 'src/app/features/authentication/login/user.response';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})

export class LoginDialogComponent {
  isVisible$ = this.loginDialog.visible$;
  visible: boolean = true;

  emailOrUsername: string = '';
  password: string = '';
  userResponse?: UserResponse;

  constructor(
    private redirectService: RedirectService,
    private userService: UserService,
    private tokenService: TokenService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private router: Router,
    private loginDialog : LoginDialogService
  ) { }


  closeDialog() {
    this.loginDialog.hide();
    this.visible = true;
  }


  navigateToForgotPassword() {
    this.redirectService.redirectAndReload('/forgot_password');
  }


  login() {
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

}
