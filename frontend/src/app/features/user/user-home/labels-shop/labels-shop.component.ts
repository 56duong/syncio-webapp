import { Component } from '@angular/core';
import { Label } from 'src/app/core/interfaces/label';
import { LabelService } from 'src/app/core/services/label.service';


@Component({
  selector: 'app-labels-shop',
  templateUrl: './labels-shop.component.html',
  styleUrls: ['./labels-shop.component.scss']
})

export class LabelsShopComponent {
    //layout: string = 'grid';

    labels!: Label[];

    constructor(private labelService: LabelService) {}

    ngOnInit() {
      this.labelService.getLabels().subscribe({
          next: (data) => {
              this.labels = data.slice(0, 12);
          },
          error: (error) => {
              console.error('Error fetching labels', error);
          },
      });
  }

  getImageUrl(url: string) {
    return url + '?' + Date.now();
}

    // getSeverity(status: string) {
    //     switch (status) {
    //         case 'INSTOCK':
    //             return 'success';

    //         case 'LOWSTOCK':
    //             return 'warning';

    //         case 'OUTOFSTOCK':
    //             return 'danger';

    //         default:
    //             return null;
    //     }
    // };
}
