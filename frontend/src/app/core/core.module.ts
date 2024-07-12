import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserIdToNamePipe } from './pipes/user-id-to-name.pipe';
import { FormsModule } from '@angular/forms';
import { RemoveMyUsernamePipe } from './pipes/remove-my-username.pipe';
import { DateAgoPipePipe } from './pipes/date-ago-pipe.pipe';
import { UrlifyPipe } from './pipes/urlify.pipe';
import { FallbackSrcDirective } from './directives/fallback-src.directive';

@NgModule({
  declarations: [UserIdToNamePipe, RemoveMyUsernamePipe, DateAgoPipePipe, UrlifyPipe, FallbackSrcDirective],
  imports: [CommonModule, FormsModule],
  exports: [
    UserIdToNamePipe, 
    RemoveMyUsernamePipe, 
    DateAgoPipePipe,
    UrlifyPipe,
    FallbackSrcDirective
  ],
})

export class CoreModule {}
