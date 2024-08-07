import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { ImageSearchComponent } from './components/image-search/image-search.component';

const routes: Routes = [
  {
    path: 'edit-profile',
    component: ProfileFormComponent,
  },
  {
    path: 'image-search',
    component: ImageSearchComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SettingRoutingModule { }
