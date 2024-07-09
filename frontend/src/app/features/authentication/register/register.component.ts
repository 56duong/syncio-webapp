import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from '../login/user.response';
import { RegisterDTO } from './register.dto';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(
    private userService: UserService,
    private toastService: ToastService,
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

  register() {
    this.isLoading = true;
    const usernameRegex = /^[a-zA-Z0-9]{3,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!usernameRegex.test(this.username)) {
      if (/[^a-zA-Z0-9]/.test(this.username)) {
        this.toastService.showError('Error', 'Username should not contain special characters.');
        this.isLoading = false;
        return;
      }
      if (this.username.length < 3 || this.username.length > 50) {
        this.toastService.showError('Error', 'Username should contain 3 to 50 alphanumeric characters.');
        this.isLoading = false;
        return;
      }
    }

    //validate email
    if (!emailRegex.test(this.email)) {
      if (!this.email.includes('@')) {
        this.toastService.showError('Error', 'Email should contain an "@" symbol.');
        this.isLoading = false;
        return;
      }
      if (!this.email.includes('.')) {
        this.toastService.showError('Error', 'Email should contain a domain name with a "."');
        this.isLoading = false;
        return;
      }
      this.toastService.showError('Error', 'Email is invalid.');
      this.isLoading = false;
      return;
    }
    const registerDTO: RegisterDTO = {
      username: this.username,
      email: this.email,
      password: this.password,
      retype_password: this.retypePassword,
    };

    if (this.password.length < 6 || this.password.length > 100) {
      this.toastService.showError('Error', 'Password must be between 6 and 100 characters.');
      this.isLoading = false;
      return;
    }
    this.userService.register(registerDTO).subscribe({
      next: (response: any) => {
        if (response.status === 'CREATED') {
          this.toastService.showSuccess('Success', response.message);
        }
        this.isLoading = false;
      },
      complete: () => {},
      error: (error: any) => {
        this.toastService.showError('Error', error.error.message);
        this.isLoading = false;
      },
    });
  }
}