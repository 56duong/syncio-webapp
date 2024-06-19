import { Component } from '@angular/core';
import { Label } from 'src/app/core/interfaces/label';
import { LabelService } from 'src/app/core/services/label.service';
import { UserService } from 'src/app/core/services/user.service';
import { UserResponse } from 'src/app/features/authentication/login/user.response';
import { PaymentService } from 'src/app/core/services/payment.service';
import { VNPay } from 'src/app/core/interfaces/vnpay';
import { HttpParams } from '@angular/common/http';
import { LabelResponse } from 'src/app/core/interfaces/label-response';



@Component({
  selector: 'app-labels-shop',
  templateUrl: './labels-shop.component.html',
  styleUrls: ['./labels-shop.component.scss']
})

export class LabelsShopComponent {

    labels!: LabelResponse[];
    label!: LabelResponse;
    vnpay!: VNPay;
    dateNow: any = null;
    user?: UserResponse | null = this.userService.getUserResponseFromLocalStorage();

    constructor(
      private labelService: LabelService,
      private userService: UserService,
      private paymentService: PaymentService,
    ) {}

    ngOnInit() {
      if (this.user?.id){
        this.labelService.getLabelsWithPurchaseStatus(this.user?.id).subscribe({
          next: (data) => {
              console.log(data);
              this.labels = data;
              this.dateNow = Date.now();
              this.labels.forEach((label) => {
                console.log(label.isPurcharse);
              })
          },
          error: (error) => {
              console.error('Error fetching labels', error);
          },
        });
      }
      
    }

  buyNow(label: Label) {
    if (label.id && this.user?.id && label.price) {
      let params = new HttpParams()
      .set('labelID', label.id)
      .set('userID', this.user.id)
      .set('amount', label.price);

      this.paymentService.createVNPayPayment(params).subscribe({
        next: (data)  => {
          this.vnpay = data;
          console.log(data);

          if (this.vnpay.paymentURL) {
            window.location.href = this.vnpay.paymentURL;
          }
        },
        
        error: (error) => {
          console.error('Error creating payment', error);
        }
      });
    }
  }
}
