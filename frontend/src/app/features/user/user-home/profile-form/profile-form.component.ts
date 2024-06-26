import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from 'src/app/core/interfaces/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
})
export class ProfileFormComponent {
  data_id: any;
  profilePic: string | null = null;
  profileForm: FormGroup = new FormGroup({});
  userResponse?: UserResponse | null =
    this.userService.getUserResponseFromLocalStorage();
  constructor(
    private ar: ActivatedRoute,
    private ds: UserService,
    private route: Router,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.profileForm = new FormGroup({
      username: new FormControl(
        `${this.userResponse?.username}`,
        Validators.required
      ),
      email: new FormControl(`${this.userResponse?.email}`, [
        Validators.required,
        Validators.email,
      ]),
      bio: new FormControl(`${this.userResponse?.bio || ''}`),
    });
  }
  showError(message: string) {
    this.messageService.add({
      severity: 'error',
      detail: message,
    });
  }
  showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      detail: message,
    });
  }
  updateProfile(): void {
    if (this.profileForm.valid) {
      this.userService
        .updateUser(this.profileForm.value, this.userResponse?.id)
        .subscribe({
          next: (response: any) => {

            this.userResponse = {
              ...response.data,
            };
            console.log('this.userResponse', this.userResponse);
            this.userService.saveUserResponseToLocalStorage(this.userResponse);
            this.showSuccess('Profile updated successfully');
          },
          error: (error) => {
            this.showError(error.error);
          },
        });
    } else {
      this.showError('Please fill email and username');
    }
  }
}
