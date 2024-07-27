import { Component } from '@angular/core';
import { UserService } from '../../../../../../core/services/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { ToastService } from 'src/app/core/services/toast.service';

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
  qrCodeUrl: string = ''; // URL of the QR code image
  qrCodeDialogVisible: boolean = false;
  profileId: string = ''; // user id from route params
  constructor(
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.profileForm = new FormGroup({
      username: new FormControl(
        `${this.userResponse?.username}`,
        Validators.required
      ),
      email: new FormControl(
        { value: `${this.userResponse?.email}`, disabled: true },
        [Validators.required, Validators.email]
      ),
      bio: new FormControl(`${this.userResponse?.bio || ''}`),
    });
    console.log('this.userResponse', this.userResponse);
  }

  updateProfile(): void {
    if (this.profileForm) {
      this.userService
        .updateUser(this.profileForm.value, this.userResponse?.id)
        .subscribe({
          next: (response: any) => {
            this.userResponse = {
              ...response.data,
            };
            this.userService.saveUserResponseToLocalStorage(this.userResponse);
            this.toastService.showSuccess(
              'Success',
              'Profile updated successfully'
            );
          },
          error: (error) => {
            console.log('error', error);
            this.toastService.showError('Error', error.error);
          },
        });
    } else {
      this.toastService.showError('Error', 'Please fill email and username');
    }
  }
  showQrCode() {
    const userId = this.userResponse?.id;
    if (userId) {
      this.userService.getQrCodeFromUser(userId).subscribe({
        next: (response) => {
          this.qrCodeUrl = response;
          this.qrCodeDialogVisible = true;
        },
        error: (error) => {
          console.error('Error getting QR code', error);
        },
      });
    }
  }
}
