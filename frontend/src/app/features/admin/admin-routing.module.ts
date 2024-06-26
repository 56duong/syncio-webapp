import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersManagementComponent } from './users-management/users-management.component';
import { PostsManagementComponent } from './posts-management/posts-management.component';
import { ReportedPostsComponent } from './reported-posts/reported-posts.component';
import { HiddenPostsComponent } from './hidden-posts/hidden-posts.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'users-management',
    component: UsersManagementComponent,
  },
  {
    path: 'posts-management',
    component: PostsManagementComponent,
  },
  {
    path: 'reported-posts',
    component: ReportedPostsComponent,
  },
  {
    path: 'hidden-posts',
    component: HiddenPostsComponent,
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
