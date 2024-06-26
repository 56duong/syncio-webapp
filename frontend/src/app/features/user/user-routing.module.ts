import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserHomeComponent } from './user-home/user-home.component';
import { FormsModule } from '@angular/forms';
import { StoryComponent } from './story/story.component';

const routes: Routes = [
  {
    path: '',
    component: UserHomeComponent,
    loadChildren: () =>
      import('./user-home/user-home.module').then((m) => m.UserHomeModule),
  },
  { 
    path: 'story', 
    component: StoryComponent,
    loadChildren: () => import('./story/story.module').then(m => m.StoryModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})

export class UserRoutingModule {}
