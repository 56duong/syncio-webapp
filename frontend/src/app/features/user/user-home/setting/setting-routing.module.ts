import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { ImageSearchComponent } from './components/image-search/image-search.component';
import { CloseFriendsComponent } from './components/close-friends/close-friends.component';
import { MessageControlsComponent } from './components/message-controls/message-controls.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

const routes: Routes = [
  {
    path: 'edit-profile',
    component: ProfileFormComponent,
  },
  {
    path: 'image-search',
    component: ImageSearchComponent,
  },
  {
    path: 'close-friends',
    component: CloseFriendsComponent,
  },
  {
    path: 'message-controls',
    component: MessageControlsComponent,
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SettingRoutingModule { }
