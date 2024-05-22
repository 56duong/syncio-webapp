import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/authentication/login/login.component';
import { SignupComponent } from './features/authentication/signup/signup.component';

const routes: Routes = [
  { 
    path: '', 
    title: 'Syncio',
    loadChildren: () => import('./features/user/user.module').then(m => m.UserModule) 
  },
  { 
    path: 'admin', 
    title: 'Administration | Syncio',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule) 
  },
  { 
    path: 'login', 
    title: 'Login',
    component: LoginComponent
  },
  { 
    path: 'signup', 
    title: 'Signup',
    component: SignupComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
