import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersManagementComponent } from './users-management/users-management.component';
import { PostsManagementComponent } from './posts-management/posts-management.component';
import { LabelsManagementComponent } from './labels-management/labels-management.component';
import { StickerManagementComponent } from './sticker-management/sticker-management.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'users-management',
    component: UsersManagementComponent
  },
  {
    path: 'posts-management',
    component: PostsManagementComponent
  },
  {
    path: 'labels-management',
    component: LabelsManagementComponent
  },
  {
    path: 'sticker-management',
    component: StickerManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
