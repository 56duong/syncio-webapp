import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Role } from './role';
import { UserResponse } from './user.response';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { TokenService } from '../token/token.service';
import { RoleService } from '../role/role.service';
import { LoginDTO } from './login.dto';
import { LoginResponse } from './login.response';
import { RegisterDTO } from '../register/register.dto';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('loginForm') loginForm!: NgForm;
  isActive = false;

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }
  username: string = '';
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  retypePassword: string = '';
  roles: Role[] = []; // Mảng roles
  rememberMe: boolean = true;
  selectedRole: Role | undefined; // Biến để lưu giá trị được chọn từ dropdown
  userResponse?: UserResponse;

  onEmailChange() {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (this.email.length < 6 || !emailRegex.test(this.email)) {
      alert('Invalid email');
    }
  }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private tokenService: TokenService,
    private roleService: RoleService
  ) {}

  ngOnInit() {}
  createAccount() {
    // Chuyển hướng người dùng đến trang đăng ký (hoặc trang tạo tài khoản)
    this.router.navigate(['/register']);
  }
  login() {
    const loginDTO: LoginDTO = {
      email: this.email,
      password: this.password,
      role_id: this.selectedRole?.id ?? 2,
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

            console.log('userResponse:', this.userResponse?.role.name);
            this.userService.saveUserResponseToLocalStorage(this.userResponse);
            if (this.userResponse?.role.name == 'ADMIN') {
              this.router.navigate(['/admin']);
            } else if (this.userResponse?.role.name == 'USER') {
              this.router.navigate(['/']);
            }
          },
          complete: () => {},
          error: (error: any) => {
            alert(error.error.message);
          },
        });
      },
      complete: () => {},
      error: (error: any) => {
        alert(error.error.message);
      },
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  register() {
    const registerDTO: RegisterDTO = {
      username: this.username,
      email: this.email,

      password: this.password,
      retype_password: this.retypePassword,

      // facebook_account_id: 0,
      // google_account_id: 0,
      role_id: 2,
    };
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        const confirmation = window.confirm(
          'Đăng ký thành công, mời bạn đăng nhập'
        );
        if (confirmation) {
          this.router.navigate(['/login']);
        }
      },
      complete: () => {},
      error: (error: any) => {
        alert(error?.error?.message ?? '');
      },
    });
  }
}
