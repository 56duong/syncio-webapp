import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserHomeComponent } from './user-home/user-home.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: UserHomeComponent,
    loadChildren: () =>
      import('./user-home/user-home.module').then((m) => m.UserHomeModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})
export class UserRoutingModule {}
