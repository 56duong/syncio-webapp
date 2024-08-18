import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Sticker } from 'src/app/core/interfaces/sticker';
import { StickerGroup } from 'src/app/core/interfaces/sticker-group';
import { StickerGroupService } from 'src/app/core/services/sticker-group.service';
import { StickerService } from 'src/app/core/services/sticker.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-sticker-management',
  templateUrl: './sticker-management.component.html',
  styleUrls: ['./sticker-management.component.scss']
})

export class StickerManagementComponent {

  currentUserId: string = '';

  /* ------------------------------ Sticker group ----------------------------- */
  stickerGroups: StickerGroup[] = [];
  selectedStickerGroup: StickerGroup = {
    flag: true
  };

  isStickerGroupDialogVisible: boolean = false;

  /* --------------------------------- Sticker -------------------------------- */
  selectedSticker: Sticker = {
    flag: true
  };
  selectedStickerImage: any; // selected sticker image when create new sticker

  isStickerDialogVisible: boolean = false;

  constructor(
    private messageService: MessageService,
    private stickerGroupService: StickerGroupService,
    private stickerService: StickerService,
    private tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
    this.getStickerGroups();
  }


  /* ------------------------------ STICKER GROUP ----------------------------- */

  getStickerGroups() {
    this.stickerGroupService.getStickerGroups().subscribe({
      next: (data) => {
        this.stickerGroups = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  /**
   * When user click on new sticker group button
   */
  newStickerGroup() {
    this.isStickerGroupDialogVisible = true;
    this.selectedStickerGroup = {
      flag: true
    };
  }

  /**
   * When selectedStickerGroup is not empty and user click on edit sticker group button
   */
  editStickerGroup() {
    this.isStickerGroupDialogVisible = true;
  }

  /**
   * Save sticker group
   * If selectedStickerGroup has id, update
   */
  saveStickerGroup() {
    if (this.selectedStickerGroup.id) {
      // Update
      let stickerGroup = { ...this.selectedStickerGroup };
      delete stickerGroup.stickers; // prevent sending stickers array
      this.stickerGroupService.updateStickerGroup(stickerGroup).subscribe({
        next: (data) => {
          this.isStickerGroupDialogVisible = false;
          this.messageService.add({severity:'success', summary:'Success', detail:'Sticker Group Updated'});
          // update sticker group in table
          const index = this.stickerGroups.findIndex((group) => group.id === this.selectedStickerGroup.id);
          this.stickerGroups[index] = this.selectedStickerGroup;
        },
        error: (error) => {
          console.error(error);
        }
      });
    } else {
      // Create
      this.stickerGroupService.createStickerGroup(this.selectedStickerGroup).subscribe({
        next: (data) => {
          this.isStickerGroupDialogVisible = false;
          this.messageService.add({severity:'success', summary:'Success', detail:'Sticker Group Created'});
          // set sticker group id and add to table
          this.selectedStickerGroup.id = data;
          this.stickerGroups = [...(this.stickerGroups || []), this.selectedStickerGroup];
        },
        error: (error) => {
          console.error(error);
          this.messageService.add({severity:'error', summary:'Error', detail:error.error.message});
        }
      });
    }
  }

  /**
   * When user click on a sticker group, get stickers of that group
   * @param event event.data is the selected sticker group
   */
  onStickerGroupSelect(event: any) {
    const stickerGroupId = event.data.id;
    // if sticker group has no stickers, get stickers
    if (this.selectedStickerGroup.stickers?.length === 0 || !this.selectedStickerGroup.stickers) {
      this.stickerService.getStickersByGroupId(stickerGroupId).subscribe({
        next: (data) => {
          this.selectedStickerGroup.stickers = data;
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }


  /* --------------------------------- STICKER -------------------------------- */

  /**
   * When user click on new sticker button
   */
  newSticker() {
    this.isStickerDialogVisible = true;
    this.selectedSticker = {
      flag: true
    };
  }

  /**
   * When selectedSticker is not empty and user click on edit sticker button
   */
  editSticker() {
    this.isStickerDialogVisible = true;
  }

  /**
   * Save sticker
   * If selectedSticker has id, update
   */
  saveSticker() {
    if((!this.selectedStickerImage && !this.selectedSticker.id) || !this.selectedStickerGroup.id) return;

    // set sticker group id base on selected sticker group
    this.selectedSticker.stickerGroupId = this.selectedStickerGroup.id;

    // Prepare data
    const formData = new FormData();
    formData.append('sticker', new Blob(
      [JSON.stringify(this.selectedSticker)], 
      { type: 'application/json' }
    ));
    formData.append('photo', this.selectedStickerImage);

    if (this.selectedSticker.id) {
      // Update
      this.stickerService.updateSticker(this.selectedSticker).subscribe({
        next: (data) => {
          this.isStickerDialogVisible = false;
          this.messageService.add({severity:'success', summary:'Success', detail:'Sticker  Updated'});
          
          // set sticker id and update in table
          this.selectedSticker.id = data;
          if(!this.selectedStickerGroup.stickers) return;
          const index = this.selectedStickerGroup.stickers.findIndex((sticker) => sticker.id === this.selectedSticker.id);
          this.selectedStickerGroup.stickers[index] = this.selectedSticker;
        },
        error: (error) => {
          console.error(error);
        }
      });
    } else {
      // Create
      this.stickerService.createSticker(formData).subscribe({
        next: (data) => {
          // set sticker id, createdDate, createdBy, imageUrl
          this.selectedSticker = { 
            ...this.selectedSticker,
            id: data,
            createdDate: new Date().toISOString(),
            createdBy: this.currentUserId,
            imageUrl: "stickers/" + data + ".jpg"
          };
          // close dialog and show success message
          this.isStickerDialogVisible = false;
          this.messageService.add({severity:'success', summary:'Success', detail:'Sticker  Created'});
          // add to table
          if(!this.selectedStickerGroup.id) return;
          this.selectedStickerGroup.stickers = [
            this.selectedSticker,
            ...(this.selectedStickerGroup.stickers || [])
          ];
        },
        error: (error) => {
          console.error(error);
          this.messageService.add({severity:'error', summary:'Error', detail:error.error.message});
        }
      });
    }
  }

  /**
   * When user double click on a sticker, set selected sticker and show dialog
   */
  onStickerSelect(event: any) {
    this.selectedSticker = event;
    this.isStickerDialogVisible = true;
  }

  /**
   * When select sticker image in new sticker dialog
   * @param event 
   */
  onSelectStickerImage(event: any) {
    this.selectedStickerImage = event.files[0];
  }

}
