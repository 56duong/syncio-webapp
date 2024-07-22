import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoryRoutingModule } from './story-routing.module';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { CoreModule } from 'src/app/core/core.module';
import { CreateStoryComponent } from './create-story/create-story.component';
import { StoryComponent } from './story.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CreateStoryComponent,
    StoryComponent
  ],
  imports: [
    CoreModule,
    CdkDrag,
    CommonModule,
    StoryRoutingModule,
    PrimengModule,
    PickerModule,
    SharedModule,
    FormsModule,
    ColorPickerModule,
    TranslateModule
  ]
})
export class StoryModule { }
