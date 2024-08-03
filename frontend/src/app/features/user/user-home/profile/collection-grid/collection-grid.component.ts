import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PostCollection } from 'src/app/core/interfaces/post-collection';
import { ConstructImageUrlPipe } from 'src/app/core/pipes/construct-image-url.pipe';
import { PostCollectionService } from 'src/app/core/services/post-collection.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-collection-grid',
  templateUrl: './collection-grid.component.html',
  styleUrls: ['./collection-grid.component.scss'],
  providers: [ConstructImageUrlPipe]
})

export class CollectionGridComponent {
  @Input() userProfileId: string = ''; // the owner of the collections
  @Input() currentUserId: string = ''; // the current user id

  collections: PostCollection[] = []; // the collections to show
  selectedCollection: PostCollection = {}; // the selected collection to show in dialog
  isVisibleAddCollection: boolean = false; // show or hide the dialog
  
  selectedImage: any; // the selected image to upload
  selectedImageDataUrl: any; // the selected image data url

  currentDateTime: number = Date.now(); // the current date time to refresh the image cache

  constructor(
    private postCollectionService: PostCollectionService,
    private toastService: ToastService,
    private translateService: TranslateService,
    private constructImageUrlPipe: ConstructImageUrlPipe
  ) { }


  ngOnChanges(changes: any) {
    // Reset collections when the user profile changes.
    if (changes.userProfileId && changes.userProfileId.currentValue) {
      this.getCollections();
      console.log(this.currentUserId);
    }
  }


  getCollections() {
    this.postCollectionService.getByCreatedById(this.userProfileId).subscribe({
      next: (data) => {
        this.collections = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  getCollectionImage(baseUrl?: string): string {
    // Use the pipe to transform the URL
    let fullUrl = this.constructImageUrlPipe.transform(baseUrl);
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


  onSelectImage(event: any) {
    const file = event.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImageDataUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }


  newCollection() {
    this.reset();
    this.isVisibleAddCollection = true;
  }


  editCollection(collection: PostCollection) {
    this.reset();
    
    let imageUrl = this.constructImageUrlPipe.transform(collection.imageUrl);
    // check if the image exists
    var request = new XMLHttpRequest();
    request.open("GET", imageUrl, true);
    request.send();
    request.onload = () => {
      if (request.status == 200) {
        // image exists
        this.selectedImageDataUrl = imageUrl;
        this.selectedCollection = { ...collection };
      } else {
        // image does not exist
        this.selectedCollection = { ...collection };
      }
    }
    this.isVisibleAddCollection = true;
  }


  saveCollection() {
    const formData = new FormData();
    formData.append('postCollection', new Blob(
      [JSON.stringify(this.selectedCollection)], 
      { type: 'application/json' }
    ));

    if (this.selectedCollection.id) {
      if(this.selectedImage) {
        formData.append('photo', new File([this.selectedImage], this.selectedCollection.id + '.jpg', {
          type: this.selectedImage.type,
          lastModified: this.selectedImage.lastModified,
        }));
      }

      // Update
      this.postCollectionService.update(formData).subscribe({
        next: (data) => {
          this.isVisibleAddCollection = false;
          this.toastService.showSuccess(
            this.translateService.instant('success'), 
            this.translateService.instant('updateCollectionSuccessfully')
          );
          this.currentDateTime = Date.now();
          // reset
          this.reset();
        },
        error: (error) => {
          console.error(error);
        }
      });
    } 
    else {
      if(this.selectedImage) {
        formData.append('photo', this.selectedImage);
      }

      // Create
      this.postCollectionService.create(formData).subscribe({
        next: (data) => {
          this.isVisibleAddCollection = false;
          this.toastService.showSuccess(
            this.translateService.instant('success'), 
            this.translateService.instant('collectionCreatedSuccessfully')
          );
          // set sticker group id and add to table
          this.selectedCollection.id = data;
          this.selectedCollection.imageUrl = "collections/" + data + ".jpg";
          this.collections = [this.selectedCollection, ...(this.collections || [])];
          // reset
          this.reset();
        },
        error: (error) => {
          console.error(error);
          this.toastService.showError(this.translateService.instant('error'), error.error.message);
        }
      });
    }
  }


  deleteImage() {
    if(!this.selectedCollection.id) return;

    this.postCollectionService.deleteImage(this.selectedCollection.id).subscribe({
      next: (data) => {
        if(data) {
          this.toastService.showSuccess(
            this.translateService.instant('success'), 
            this.translateService.instant('collectionImageDeletedSuccessfully')
          );
          this.selectedImageDataUrl = null;
        }
      },
      error: (error) => {
        console.error(error);
        this.toastService.showError(this.translateService.instant('error'), error.error.message);
      }
    });
  }


  reset() {
    this.selectedCollection = {};
    this.selectedImage = null;
    this.selectedImageDataUrl = null;
    this.isVisibleAddCollection = false;
  }

}
