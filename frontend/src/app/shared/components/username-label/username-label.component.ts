import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UserLabelInfoService } from 'src/app/core/services/user-label-info.service';
import { LabelUpdateService } from 'src/app/core/services/label-update.service';
import { ImageUtils } from 'src/app/core/utils/image-utils';

@Component({
  selector: 'app-username-label',
  templateUrl: './username-label.component.html',
  styleUrls: ['./username-label.component.scss']
})
export class UsernameLabelComponent implements OnInit, OnChanges {
  @Input() userId: string | undefined;
  @Input() username: string | undefined;
  @Input() fontSize: string | undefined;
  @Input() fontWeight: string | undefined;
  @Input() color: string = '#000';
  
  id!: string;
  gifUrl: string | undefined;

  constructor(
    private userLabelInfoService: UserLabelInfoService,
    private labelUpdateService: LabelUpdateService,
    public imageUtils: ImageUtils
  ) { }

  ngOnInit(): void {
    this.labelUpdateService.currentGifUrl.subscribe(() => {
      this.getUrlLabel();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && changes['userId'].currentValue) {
      this.getUrlLabel();
    }
  }

  getUrlLabel(){
    if (!this.userId) {
      console.warn('UserId is not provided or is null');
      return; // Không thực hiện bất kỳ hành động nào nếu userId là null hoặc undefined
    }

    this.id = this.userId;
    this.userLabelInfoService.getLabelURL(this.userId).subscribe({
      next: (resp) => {
        this.gifUrl = resp ? resp : undefined;
      },
      error: (error) => {
        console.error('Error fetching label URL', error);
        this.gifUrl = undefined; // gifUrl là undefined nếu có lỗi
      }
    });
  }
}
