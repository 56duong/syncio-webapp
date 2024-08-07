import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreatePostComponent } from '../create-post/create-post.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MobileTopMenuComponent } from './mobile-top-menu/mobile-top-menu.component';
import { MobileBottomMenuComponent } from './mobile-bottom-menu/mobile-bottom-menu.component';
import { MentionModule } from 'angular-mentions';



@NgModule({
  declarations: [
    LeftMenuComponent,
    CreatePostComponent,
    MobileTopMenuComponent,
    MobileBottomMenuComponent
  ],
  imports: [
    CommonModule,
    PrimengModule,
    TranslateModule,
    SharedModule,
    PickerComponent,
    MentionModule
  ],
  exports: [
    LeftMenuComponent,
    MobileTopMenuComponent,
    MobileBottomMenuComponent
  ]
})
export class MenuModule { }
