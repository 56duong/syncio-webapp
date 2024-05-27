import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: AdminComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes), FormsModule],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
