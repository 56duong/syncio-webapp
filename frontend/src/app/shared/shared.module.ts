import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { PostComponent } from './components/post/post.component';
import { LikeComponent } from './components/like/like.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { PrimengModule } from '../primeng/primeng.module';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PostComponent, LikeComponent, PostDetailComponent],
  imports: [
    PickerComponent,
    CommonModule,
    CoreModule,
    PrimengModule,
    FormsModule,
  ],
  exports: [PostComponent],
})
export class SharedModule {}
