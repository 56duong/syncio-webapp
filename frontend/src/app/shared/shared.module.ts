import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { PostComponent } from './components/post/post.component';
import { LikeComponent } from './components/like/like.component';
import { PostDetailComponent } from './components/post-detail/post-detail.component';
import { PrimengModule } from '../primeng/primeng.module';



@NgModule({
  declarations: [
    PostComponent,
    LikeComponent,
    PostDetailComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    PrimengModule
  ],
  exports: [
    PostComponent
  ]
})
export class SharedModule { }
