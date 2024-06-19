import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.scss'],
})
export class PaymentInfoComponent implements OnInit {
  responseCode: string | null = null;
  orderInfo: string | null = null;
  amount: number | null = null;
  formattedAmount: string | null = null;
  payDate: string | null = null;
  datePipe: any;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.responseCode = this.route.snapshot.queryParamMap.get('responseCode');
    this.orderInfo = this.route.snapshot.queryParamMap.get('orderInfo');

    this.amount = this.route.snapshot.queryParams['amount'];
    if (this.amount) {
      this.formattedAmount = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(this.amount);
    }

    this.payDate = this.route.snapshot.queryParamMap.get('payDate');
    if (this.payDate) {
      let year = +this.payDate.substring(0, 4);
      let month = +this.payDate.substring(4, 6) - 1; // JS dem thang tu 0 
      let day = +this.payDate.substring(6, 8);
      let hour = +this.payDate.substring(8, 10);
      let minute = +this.payDate.substring(10, 12);
      let second = +this.payDate.substring(12, 14);
      let date = new Date(year, month, day, hour, minute, second); console.log(date)

      this.datePipe = new DatePipe('en-US').transform(date, 'HH:mm:ss dd-MM-yyyy');
    }
  }

}
