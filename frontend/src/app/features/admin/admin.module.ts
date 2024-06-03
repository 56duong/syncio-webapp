import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { UsersManagementComponent } from './users-management/users-management.component';
import { PostsManagementComponent } from './posts-management/posts-management.component';

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
    PrimengModule
  ]
})
export class AdminModule { }
