import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserIdToNamePipe } from './pipes/user-id-to-name.pipe';
import { FormsModule } from '@angular/forms';
import { RemoveMyUsernamePipe } from './pipes/remove-my-username.pipe';

@NgModule({
  declarations: [UserIdToNamePipe, RemoveMyUsernamePipe],
  imports: [CommonModule, FormsModule],
  exports: [UserIdToNamePipe, RemoveMyUsernamePipe],
})
export class CoreModule {}
