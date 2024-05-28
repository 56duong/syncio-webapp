import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/core/services/user.service';
import { FogotPasswordDTO } from './changepassword.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
@Component({
  selector: 'app-change-password',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss'],
  providers: [MessageService],
})
export class ChangePasswordComponent implements OnInit {
  @ViewChild('changepassword') changepassword!: NgForm;
  token: string | null = null;
  password: string = '';
  retypePassword: string = '';
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  showSuccess(message: string) {
    this.messageService.add({
      severity: 'Success',
      detail: message,
    });
  }
  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      detail: message,
    });
  }

  changePassword() {
    if (this.password && this.retypePassword) {
      const passwordValidationMessage = this.validatePassword(this.password);
      if (passwordValidationMessage) {
        this.showError(passwordValidationMessage);
      } else if (this.password !== this.retypePassword) {
        this.showError('Passwords do not match');
      } else {
        this.userService.resetPassword(this.token, this.password).subscribe({
          next: () => this.showSuccess('Password changed successfully'),
          error: (error: any) => this.showError("Couldn't change password"),
        });
      }
    } else {
      alert('Please fill out the form correctly');
    }
  }
  validatePassword(password: string): string | null {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long.`;
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number.';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character.';
    }
    return null;
  }
}
