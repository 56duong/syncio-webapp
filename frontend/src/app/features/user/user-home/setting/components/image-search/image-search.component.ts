import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConstructImageUrlPipe } from 'src/app/core/pipes/construct-image-url.pipe';
import { RedirectService } from 'src/app/core/services/redirect.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';
import { UserSettingService } from 'src/app/core/services/user-setting.service';

@Component({
  selector: 'app-image-search',
  templateUrl: './image-search.component.html',
  styleUrls: ['./image-search.component.scss']
})

export class ImageSearchComponent {
  currentUserId: string = '';
  currentDateTime: number = Date.now();

  constructor(
    private tokenService: TokenService, 
    private toastService: ToastService,
    private userSettingService: UserSettingService,
    private redirectService: RedirectService,
    private translateService: TranslateService
  ) { }


  ngOnInit() {
    this.currentUserId = this.tokenService.extractUserIdFromToken();
  }


  getAvatarURL(): string {
    const constructImageUrlPipe = new ConstructImageUrlPipe(); // Manually create an instance
    let baseUrl = 'user-setting/image_search_' + this.currentUserId + '.jpg'; // Construct the base URL
    // Use the pipe to transform the URL
    let fullUrl = constructImageUrlPipe.transform(baseUrl);
    // Check if the URL already contains a query parameter
    if (fullUrl.includes('?')) {
      fullUrl += '&';
    } else {
      fullUrl += '?';
    }
    // Append the current date
    fullUrl += this.currentDateTime;
    return fullUrl;
  }


  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      let newAvatarFileNames = 'image_search_' + this.currentUserId + '.jpg';
      // Append and rename the file with user id
      const fd = new FormData();
      fd.append('file', new File([file], newAvatarFileNames, {
        type: file.type,
        lastModified: file.lastModified,
      }));

      this.userSettingService.updateImageSearch(fd).subscribe({
        next: () => {
          this.toastService.showSuccess(
            this.translateService.instant('success'), 
            this.translateService.instant('imageSearchUpdatedSuccessfully')
          );
          this.currentDateTime = Date.now();
        },
        error: (error) => {
          console.error('Error updating image search:', error);
        }
      });
    }
  }


  deleteImageSearch() {
    this.userSettingService.deleteImageSearch().subscribe({
      next: (response) => {
        if(response) {
          this.toastService.showSuccess(
            this.translateService.instant('success'), 
            this.translateService.instant('imageSearchDeletedSuccessfully')
          );
          setTimeout(() => {
            this.redirectService.reloadPage();
          }, 1500);
        }
        else {
          this.toastService.showError('Error', 'Failed to delete image search');
        }
      },
      error: (error) => {
        console.error('Error deleting image search:', error);
      }
    });
  }

}
