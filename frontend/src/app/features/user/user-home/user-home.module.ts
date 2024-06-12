import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserHomeRoutingModule } from './user-home-routing.module';
import { UserHomeComponent } from './user-home.component';
import { CreatePostComponent } from './create-post/create-post.component';
import { FeedComponent } from './feed/feed.component';
import { LeftMenuComponent } from './left-menu/left-menu.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { TopMenuComponent } from './top-menu/top-menu.component';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfileComponent } from './profile/profile.component';
import { MessagesComponent } from './messages/messages.component';
import { SearchComponent } from './search/search.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MessageContentComponent } from './messages/message-content/message-content.component';
import { StoryListComponent } from '../story/story-list/story-list.component';
import { ViewStoryComponent } from '../story/view-story/view-story.component';
import { SearchSuggestionComponent } from './search/search-suggestion/search-suggestion.component';

@NgModule({
  declarations: [
    UserHomeComponent,
    CreatePostComponent,
    FeedComponent,
    LeftMenuComponent,
    TopMenuComponent,
    ProfileComponent,
    MessagesComponent,
    SearchComponent,
    MessageContentComponent,
    StoryListComponent,
    ViewStoryComponent,
    SearchSuggestionComponent

  ],
  imports: [
    CommonModule,
    UserHomeRoutingModule,
    PrimengModule,
    CoreModule,
    SharedModule,
    PickerComponent,
  ],
})
export class UserHomeModule {}
