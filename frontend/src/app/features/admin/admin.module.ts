import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { UsersManagementComponent } from './users-management/users-management.component';
import { PostsManagementComponent } from './posts-management/posts-management.component';
import { ReportedPostsComponent } from './reported-posts/reported-posts.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HiddenPostsComponent } from './hidden-posts/hidden-posts.component';



@NgModule({
  declarations: [
    AdminComponent,
    DashboardComponent,
    UsersManagementComponent,
    PostsManagementComponent,
    ReportedPostsComponent,
    HiddenPostsComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    PrimengModule,
    SharedModule
  ]
})
export class AdminModule { }
