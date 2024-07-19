import { Component, OnInit, Input } from '@angular/core';
import { UserLabelInfoService } from 'src/app/core/services/user-label-info.service';
import { LabelUpdateService } from 'src/app/core/services/label-update.service';

@Component({
  selector: 'app-username-label',
  templateUrl: './username-label.component.html',
  styleUrls: ['./username-label.component.scss']
})
export class UsernameLabelComponent implements OnInit {
  @Input() userId: string | undefined;
  @Input() username: string | undefined;
  @Input() fontSize: string | undefined;
  @Input() fontWeight: string | undefined;
  @Input() color: string = '#000';
  
  id!: string;
  gifUrl: string | undefined;

  constructor(
    private userLabelInfoService: UserLabelInfoService,
    private labelUpdateService: LabelUpdateService
  ) { }

  ngOnInit(): void {
    if (this.userId){
      this.id = this.userId;
      this.userLabelInfoService.getLabelURL(this.userId).subscribe({
        next: (resp) => {
          if (resp) {
            this.gifUrl = resp;
          } else {
            this.gifUrl = undefined; // gifUrl là undefined nếu resp là null
          }
        },
        error: (error) => {
          this.gifUrl = undefined; // gifUrl là undefined nếu có lỗi
        }
      });

      this.labelUpdateService.currentGifUrl.subscribe((gifUrl) => {
        if (gifUrl) {
          this.gifUrl = gifUrl;
        } else {
          this.gifUrl = undefined;
        }
      });
    }
    
  }
}
