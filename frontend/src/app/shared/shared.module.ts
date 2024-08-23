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
import { VoiceRecorderDialogComponent } from './components/voice-recorder-dialog/voice-recorder-dialog.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NotAuthorizedComponent } from './components/not-authorized/not-authorized.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { UsernameLabelComponent } from './components/username-label/username-label.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingComponent } from './components/loading/loading.component';
import { UpdateIpComponent } from './components/update-ip/update-ip.component';
import { CollectionListComponent } from './components/collection-list/collection-list.component';
import { CollectionDetailComponent } from './components/collection-detail/collection-detail.component';
import { UserReportComponent } from './components/user-report/user-report.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';

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
    VoiceRecorderDialogComponent,
    NotFoundComponent,
    NotAuthorizedComponent,
    AvatarComponent,
    UsernameLabelComponent,
    LoadingComponent,
    UpdateIpComponent,
    CollectionListComponent,
    CollectionDetailComponent,
    UserReportComponent,
    LoginDialogComponent,
  ],
  imports: [
    PickerComponent,
    CommonModule,
    CoreModule,
    PrimengModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [
    PostComponent,
    ResizableDraggableComponent,
    StickerPickerComponent,
    PostDetailComponent,
    GlobalDialogComponent,
    VoiceRecorderDialogComponent,
    AvatarComponent,
    UsernameLabelComponent,
    LoadingComponent,
    CollectionListComponent,
    UserReportComponent,
    LoginDialogComponent,
  ],
})
export class SharedModule {}
