import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeedComponent } from './feed/feed.component';
import { ProfileComponent } from './profile/profile.component';
import { MessagesComponent } from './messages/messages.component';

const routes: Routes = [
  { 
    path: '', 
    component: FeedComponent 
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'messages',
    component: MessagesComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})

export class UserHomeRoutingModule { }
