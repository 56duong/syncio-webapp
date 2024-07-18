import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { PostComponent } from './components/post/post.component';
import { LikeComponent } from './components/like/like.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { PrimengModule } from '../primeng/primeng.module';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportComponent } from './components/report/report.component';
import { ResizableDraggableComponent } from './components/resizable-draggable/resizable-draggable.component';
import { StickerPickerComponent } from './components/sticker-picker/sticker-picker.component';
import { GlobalDialogComponent } from './components/global-dialog/global-dialog.component';
import { CommentListComponent } from './components/post-detail/comment-list/comment-list.component';
import { UsernameLabelComponent } from './components/username-label/username-label.component';

@NgModule({
  declarations: [
    PostComponent, 
    LikeComponent, 
    PostDetailComponent,
    ReportComponent,
    ResizableDraggableComponent,
    StickerPickerComponent,
    GlobalDialogComponent,
    CommentListComponent,
    UsernameLabelComponent
  ],
  imports: [
    PickerComponent,
    CommonModule,
    CoreModule,
    PrimengModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    PostComponent,
    ResizableDraggableComponent,
    StickerPickerComponent,
    PostDetailComponent,
    GlobalDialogComponent,
    UsernameLabelComponent
  ],
})
export class SharedModule {}
