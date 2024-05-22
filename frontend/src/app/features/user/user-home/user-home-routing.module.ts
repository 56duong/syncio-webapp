import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from './feed/feed.component';
import { ProfileComponent } from './profile/profile.component';
import { MessagesComponent } from './messages/messages.component';
import { SearchComponent } from './search/search.component';
import { CreatePostComponent } from './create-post/create-post.component';

const routes: Routes = [
  { 
    path: '', 
    component: FeedComponent 
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'messages',
    component: MessagesComponent
  },
  {
    path: 'create-post',
    component: CreatePostComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class UserHomeRoutingModule { }
