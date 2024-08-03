import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PostCollection } from 'src/app/core/interfaces/post-collection';
import { PostCollectionService } from 'src/app/core/services/post-collection.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { TokenService } from 'src/app/core/services/token.service';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})

export class CollectionListComponent {
  @Input() postId: string = ''; // the post id to save to collections
  @Input() isVisible: boolean = false; // show or hide the dialog
  @Input() currentUserId: string = ''; // the current user id
  @Output() closeDialogEvent = new EventEmitter(); // event to close the dialog

  collections: PostCollection[] = []; // all collections of the current user to show in the dialog
  selectedCollectionIds: string[] = []; // the selected collections to save the post

  newCollection: PostCollection = {}; // the new collection to create
  isShowNewCollection: boolean = false; // show or hide the new collection form
  selectedImage: any; // the selected image to upload
  selectedImageDataUrl: any; // the selected image data url

  constructor(
    private postCollectionService: PostCollectionService,
    private tokenService: TokenService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) { }


  ngOnInit() {
    if(!this.currentUserId) {
      this.currentUserId = this.tokenService.extractUserIdFromToken();
    }
    this.getCollections();
  }


  ngOnChanges(changes: any) {
    if (changes.isVisible && changes.isVisible.currentValue) {
      this.getSelectedCollectionByPostIdAndUserId(this.currentUserId);
    }
  }


  getCollections() {
    this.postCollectionService.getByCreatedById(this.currentUserId).subscribe({
      next: (data) => {
        this.collections = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  getSelectedCollectionByPostIdAndUserId(userId: string) {
    this.postCollectionService.getByPostIdAndCreatedById(this.postId, userId).subscribe({
      next: (data) => {
        this.selectedCollectionIds = data
          .map((collection) => collection.id)
          .filter((id): id is string => id !== undefined); // Filter out undefined values
      },
      error: (error) => {
        console.error(error); 
      }
    });
  }


  closeDialog() {
    this.closeDialogEvent.emit();
  }


  create() {
    const formData = new FormData();
    formData.append('postCollection', new Blob(
      [JSON.stringify(this.newCollection)], 
      { type: 'application/json' }
    ));
    formData.append('photo', this.selectedImage);

    this.postCollectionService.create(formData).subscribe({
      next: (data) => {
        this.isShowNewCollection = false;
        this.toastService.showSuccess(
          this.translateService.instant('success'), 
          this.translateService.instant('collectionCreatedSuccessfully')
        );
        // set collection group id and add to table
        this.newCollection.id = data;
        this.collections = [this.newCollection, ...(this.collections || [])];
        this.newCollection = {};
      },
      error: (error) => {
        console.error(error);
        this.toastService.showError('Error', error.error.message);
      }
    });
  }


  save() {
    this.postCollectionService.saveToCollections(this.postId, this.selectedCollectionIds).subscribe({
      next: (data) => {
        this.toastService.showSuccess(
          this.translateService.instant('success'), 
          this.translateService.instant('updateCollectionSuccessfully')
        );
        this.closeDialog();
      },
      error: (error) => {
        console.error(error);
        this.toastService.showError('Error', error.error.message);
      }
    });
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

}
