import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/core/services/user.service';
import { FogotPasswordDTO } from './forgotpassword.dto';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.scss'],
  providers: [MessageService],
})
export class ForgotpasswordComponent implements OnInit {
  @ViewChild('forgotpassword') forgotpassword!: NgForm;
  email: string = '';
  ngOnInit() {}
  constructor(
    private router: Router,
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
  sendPasswordToMail() {
    if (!this.email) {
      alert('Please enter your email');
      return;
    }
    const fogotPasswordDTO: FogotPasswordDTO = {
      email: this.email,
    };
    this.userService.sendPasswordToMailSerive(fogotPasswordDTO).subscribe({
      next: () =>
        this.showSuccess('Please check your email to reset your password'),
      error: (error: any) => {
        console.log(error);
        this.showError(error.error.message);
      },
    });
  }
}
