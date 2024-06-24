import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserResponse } from './user.response';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { RoleService } from '../role/role.service';
import { LoginDTO } from './login.dto';
import { LoginResponse } from './login.response';
import { RegisterDTO } from '../register/register.dto';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { HttpClient } from '@angular/common/http';
import { TokenService } from 'src/app/core/services/token.service';
import { NotificationService } from 'src/app/core/services/notification.service';
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

  onEmailChange() {}
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (token) {
        this.confirmRegistration(token);
      }
    });
  }

  createAccount() {
    this.router.navigate(['/register']);
  }
  navigateToForgotPassword() {
    this.router.navigate(['/forgot_password']);
  }

  login() {
    console.log('login', this.email);
    if (this.email == null || this.email == '') {
      this.notificationService.showError('Email is required');
      return;
    }
    if (this.password == null || this.password == '') {
      this.notificationService.showError(' Password is required');
      return;
    }
    const loginDTO: LoginDTO = {
      email: this.email,
      password: this.password,
      role_name: 'USER',
    };
    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        const { token, refresh_token } = response.data;
        this.tokenService.setToken(token);

        this.userService.getUserDetail(token).subscribe({
          next: (response: any) => {
            this.userResponse = {
              ...response,
            };

            this.userService.saveUserResponseToLocalStorage(this.userResponse);
            if (this.userResponse?.role == 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (this.userResponse?.role == 'USER') {
              this.router.navigate(['/']);
            }
          },
          complete: () => {},
          error: (error: any) => {
            this.notificationService.showError(error.error.message);
          },
        });
      },
      complete: () => {},
      error: (error: any) => {
        this.notificationService.showError(error.error.message);
      },
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  register() {
    const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!usernameRegex.test(this.username)) {
      if (/[^a-zA-Z0-9]/.test(this.username)) {
        this.notificationService.showError(
          'Username should not contain special characters.'
        );
        return;
      }
      if (this.username.length < 3 || this.username.length > 50) {
        this.notificationService.showError(
          'Username should contain 3 to 50 alphanumeric characters.'
        );
        return;
      }
    }

    //validate email
    if (!emailRegex.test(this.email)) {
      if (!this.email.includes('@')) {
        this.notificationService.showError(
          'Email should contain an "@" symbol.'
        );
        return;
      }
      if (!this.email.includes('.')) {
        this.notificationService.showError(
          'Email should contain a domain name with a "."'
        );
        return;
      }
      this.notificationService.showError('Email is invalid.');
      return;
    }
    const registerDTO: RegisterDTO = {
      username: this.username,
      email: this.email,

      password: this.password,
      retype_password: this.retypePassword,
    };
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        if (response.status === 'CREATED') {
          this.deactivate();
          this.notificationService.showSuccess(response.message);
        }
      },
      complete: () => {},
      error: (error: any) => {
        this.notificationService.showError(error?.error?.message ?? '');
      },
    });
  }

  confirmRegistration(token: string): void {
    this.userService.confirmUserRegister(token).subscribe({
      next: (response: any) => {
        console.log('Registration confirmed:', response);
        this.notificationService.showSuccess(response.message);
      },
      complete: () => {},
      error: (error: any) => {
        this.notificationService.showError(error?.error?.message ?? '');
      },
    });
  }
}
