import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewStoryComponent } from './view-story/view-story.component';
import { StoryListComponent } from './story-list/story-list.component';
import { CreateStoryComponent } from './create-story/create-story.component';
import { RoleEnum } from 'src/app/core/interfaces/user';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: StoryListComponent 
  },
  {
    path: 'create',
    component: CreateStoryComponent,
    canActivate: [authGuard],
    data: { requiredRoles: [RoleEnum.USER] }
  },
  {
    path: ':userId',
    component: ViewStoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class StoryRoutingModule { }
