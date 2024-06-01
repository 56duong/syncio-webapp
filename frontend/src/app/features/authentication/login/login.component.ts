import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserResponse } from './user.response';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { TokenService } from '../token/token.service';
import { RoleService } from '../role/role.service';
import { LoginDTO } from './login.dto';
import { LoginResponse } from './login.response';
import { RegisterDTO } from '../register/register.dto';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
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
    this.email = '';
    this.password = '';
  }

  deactivate() {
    this.isActive = false;
    this.email = '';
    this.password = '';
  }
  username: string = '';
  email: string = '';
  password: string = '';
  retypePassword: string = '';
  showPassword: boolean = false;
  roles: string[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: string | undefined; // Biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse;

  onEmailChange() {
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // if (this.email.length < 6 || !emailRegex.test(this.email)) {
    //   this.showError('Invalid email');
    // }
  }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private messageService: MessageService
  ) {}

  ngOnInit() {}
  createAccount() {
    this.router.navigate(['/register']);
  }
  navigateToForgotPassword() {
    this.router.navigate(['/forgot_password']);
  }
  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      detail: message,
    });
  }
  showSuccess(message: string) {
    this.messageService.add({
      severity: 'Success',
      summary: 'Authentication Failed',
      detail: 'API Key or URL is invalid.',
    });
  }
  login() {
    if (this.email == null || this.email == '') {
      this.showError('Email is required');
      return;
    }
    if (this.password == null || this.password == '') {
      this.showError(' Password is required');
      return;
    }
    const loginDTO: LoginDTO = {
      email: this.email,
      password: this.password,
      role_name: "USER",
    };
    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        const { token } = response.data;

        this.tokenService.setToken(token);

        this.userService.getUserDetail(token).subscribe({
          next: (response: any) => {
            this.userResponse = {
              ...response,
            };

            this.userService.saveUserResponseToLocalStorage(this.userResponse);
            if (this.userResponse?.role_name == 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (this.userResponse?.role_name == 'USER') {
              this.router.navigate(['/']);
            }
          },
          complete: () => {},
          error: (error: any) => {
            this.showError(error.error.message);
          },
        });
      },
      complete: () => {},
      error: (error: any) => {
        this.showError(error.error.message);
      },
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  register() {
    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;

    if (!usernameRegex.test(this.username)) {
      this.showError('It should contain at least 3 characters.');
      return;
    }
    const registerDTO: RegisterDTO = {
      username: this.username,
      email: this.email,

      password: this.password,
      retype_password: this.retypePassword,

      // facebook_account_id: 0,
      // google_account_id: 0,
      role_name: 'USER',
    };
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        if (response.status === 'CREATED') {
          this.deactivate();
        }
      },
      complete: () => {},
      error: (error: any) => {
        this.showError(error?.error?.message ?? '');
      },
    });
  }
}
