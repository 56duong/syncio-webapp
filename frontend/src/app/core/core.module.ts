import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserIdToNamePipe } from './pipes/user-id-to-name.pipe';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [UserIdToNamePipe],
  imports: [CommonModule, FormsModule],
  exports: [UserIdToNamePipe],
})
export class CoreModule {}
