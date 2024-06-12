import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoryComponent } from './story.component';
import { ViewStoryComponent } from './view-story/view-story.component';
import { StoryListComponent } from './story-list/story-list.component';
import { CreateStoryComponent } from './create-story/create-story.component';

const routes: Routes = [
  { 
    path: '', 
    component: StoryListComponent 
  },
  {
    path: 'create',
    component: CreateStoryComponent
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
