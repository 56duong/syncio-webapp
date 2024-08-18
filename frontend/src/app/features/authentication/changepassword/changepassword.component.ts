import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from 'src/app/core/services/loading.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss'],
})

export class ChangePasswordComponent implements OnInit {

  @ViewChild('changepassword') changepassword!: NgForm;
  token: string | null = null;
  password: string = '';
  retypePassword: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private translateService: TranslateService
  ) {}


  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }


  changePassword() {
    if (!this.password && !this.retypePassword) {
      this.toastService.showError(
        this.translateService.instant('common.error'), 
        this.translateService.instant('change_password.please_fill_in_both_fields')
      );
      return;
    }

    this.loadingService.show();

    // validate password length
    if (this.password.length < 6 || this.password.length > 100) {
      this.toastService.showError(
        this.translateService.instant('common.error'), 
        this.translateService.instant('change_password.password_should_be_at_least_6_characters_and_at_most_100_characters'));
      this.loadingService.hide();
      return;
    }
    
    // validate password match
    if (this.password !== this.retypePassword) {
      this.toastService.showError(
        this.translateService.instant('common.error'), 
        this.translateService.instant('change_password.passwords_do_not_match'));
      this.loadingService.hide();
      return;
    }

    this.userService.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.showSuccess(
          this.translateService.instant('common.success'),
          this.translateService.instant('change_password.password_changed_successfully'));
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (error: any) => {
        this.loadingService.hide();
        console.log(error);
        this.toastService.showError(
          this.translateService.instant('common.error'),
          error.error.message
        );
      }
    });
  }

}
