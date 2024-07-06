import { Component } from '@angular/core';
import { Label } from 'src/app/core/interfaces/label';
import { LabelService } from 'src/app/core/services/label.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { PaymentService } from 'src/app/core/services/payment.service';
import { VNPay } from 'src/app/core/interfaces/vnpay';
import { HttpParams } from '@angular/common/http';
import { LabelResponse } from 'src/app/core/interfaces/label-response';
import { ToastService } from 'src/app/core/services/toast.service';



@Component({
  selector: 'app-labels-shop',
  templateUrl: './labels-shop.component.html',
  styleUrls: ['./labels-shop.component.scss']
})

export class LabelsShopComponent {
    labelDialog: boolean = false;
    submitted: boolean = false;
    labels!: LabelResponse[];
    label!: LabelResponse;
    vnpay!: VNPay;
    type?: string;
    statuses?: any[];
    dateNow: any = null;
    user?: UserResponse | null = this.userService.getUserResponseFromLocalStorage();

    constructor(
      private labelService: LabelService,
      private userService: UserService,
      private toastService: ToastService,
      private paymentService: PaymentService,
    ) {}

    ngOnInit() {
      if (this.user?.id){
        this.labelService.getLabelsWithPurchaseStatus(this.user?.id).subscribe({
          next: (data) => {
              console.log(data);
              this.labels = data;
              this.dateNow = Date.now();
              this.labels.forEach((label) => label.type = label.labelURL?.split('.').pop()?.toLocaleUpperCase());
          },
          error: (error) => {
              console.error('Error fetching labels', error);
          },
        });
      }
    }

  hideDialog() {
      //this.selectedLabels = []; // xoá label đã chọn -> khi mở dialog lên sẽ không hiển thị label đã chọn
      this.labelDialog = false;
      this.submitted = false;
  }

  buyNow(label: Label) {
    this.submitted = true;

    if (label.id) {
      let params = new HttpParams()
      .set('labelID', label.id)

      console.log("params: " + params.toString());

      this.paymentService.createVNPayPayment(params).subscribe({
        next: (data)  => {
          this.vnpay = data;
          console.log(data);

          if (this.vnpay.paymentURL) {
            window.location.href = this.vnpay.paymentURL;
          }
        },
        
        error: (error) => {
          this.toastService.showError('Error', error.error.message);
        }
      });
    }
  }


  gift(label: Label) {
    this.label = { ...label };
    this.labelDialog = true;
  }

  sendGift() {
    this.submitted = true;

    if (this.label.owner == null || this.label.owner == "") {
      this.toastService.showError('Error','Please enter username you want to send a gift');
      return;
    }

    if (this.label.id) {
      let params = new HttpParams()
      .set('labelID', this.label.id)

      if (this.label.owner) {
        params = params.set('owner', this.label.owner);
      }

      this.paymentService.createVNPayPayment(params).subscribe({
        next: (data)  => {
          this.vnpay = data;
          console.log(data);

          if (this.vnpay.paymentURL) {
            window.location.href = this.vnpay.paymentURL;
          }
        },
        
        error: (error) => {
          this.toastService.showError('Error', error.error.message);
        }
      });
    }
  }

}
