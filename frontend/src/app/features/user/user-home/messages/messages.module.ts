import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessageItemComponent } from './message-item/message-item.component';
import { MessageContentComponent } from './message-content/message-content.component';
import { CoreModule } from 'src/app/core/core.module';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessagesComponent } from './messages.component';


@NgModule({
  declarations: [
    MessagesComponent,
    MessageContentComponent,
    MessageItemComponent
  ],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    CoreModule,
    PrimengModule,
    PickerComponent,
  ]
})
export class MessagesModule { }
