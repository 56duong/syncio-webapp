import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessageItemComponent } from './message-item/message-item.component';
import { MessageContentListComponent } from './message-content-list/message-content-list.component';
import { CoreModule } from 'src/app/core/core.module';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessagesComponent } from './messages.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MessageItemContentComponent } from './message-item-content/message-item-content.component';
import { SelectUserDialogComponent } from './select-user-dialog/select-user-dialog.component';
import { MessageRoomDetailComponent } from './message-room-detail/message-room-detail.component';

@NgModule({
  declarations: [
    MessagesComponent,
    MessageContentListComponent,
    MessageItemComponent,
    MessageItemContentComponent,
    SelectUserDialogComponent,
    MessageRoomDetailComponent
  ],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    CoreModule,
    PrimengModule,
    PickerComponent,
    SharedModule
  ]
})
export class MessagesModule { }
