import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { PostComponent } from './components/post/post.component';
import { LikeComponent } from './components/like/like.component';



@NgModule({
  declarations: [
    PostComponent,
    LikeComponent
  ],
  imports: [
    CommonModule,
    CoreModule
  ],
  exports: [
    PostComponent
  ]
})
export class SharedModule { }
