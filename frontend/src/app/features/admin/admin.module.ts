import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { RouterModule, Routes } from '@angular/router';
import { UsersManagementComponent } from './users-management/users-management.component';
import { PostsManagementComponent } from './posts-management/posts-management.component';

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
  }

];

@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    UsersManagementComponent,
    PostsManagementComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    PrimengModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
