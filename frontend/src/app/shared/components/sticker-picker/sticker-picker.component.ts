import { Component, EventEmitter, Output } from '@angular/core';
import { Sticker } from 'src/app/core/interfaces/sticker';
import { StickerGroup } from 'src/app/core/interfaces/sticker-group';
import { StickerGroupService } from 'src/app/core/services/sticker-group.service';
import { StickerService } from 'src/app/core/services/sticker.service';

@Component({
  selector: 'app-sticker',
  templateUrl: './sticker-picker.component.html',
  styleUrls: ['./sticker-picker.component.scss']
})

export class StickerPickerComponent {
  @Output() stickerClick = new EventEmitter<any>();
  stickerGroups: StickerGroup[] = [];

  constructor(
    private stickerService: StickerService,
    private stickerGroupService: StickerGroupService
  ) { }

  ngOnInit(): void {
    this.stickerGroupService.getStickerGroupByFlagTrue().subscribe({
      next: (data) => {
        // get all sticker groups
        this.stickerGroups = data;
        // loop through each group and get stickers
        this.stickerGroups.forEach((group) => {
          if(!group.id) return;
          this.stickerService.getStickersByGroupIdAndFlagTrue(group.id).subscribe({
            next: (stickers) => {
              group.stickers = stickers;
              // remove group if no stickers
              if(stickers.length === 0) {
                this.stickerGroups = this.stickerGroups.filter((g) => g.id !== group.id);
              }
            },
            error: (error) => {
              console.log(error);
            }
          });
        });
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  /**
   * When a sticker is clicked, emit the sticker object
   * @param sticker 
   */
  onStickerClick(sticker: Sticker) {
    const newSticker = {...sticker};
    newSticker.imageUrl = sticker.imageUrl;
    this.stickerClick.emit(newSticker);
  }

}
