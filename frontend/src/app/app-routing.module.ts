import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/authentication/login/login.component';
import { SignupComponent } from './features/authentication/signup/signup.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    // your components
  ],
  imports: [
    // other modules
    ToastModule,
  ],
  // providers, bootstrap, etc.
})
export class YourModule {}
const routes: Routes = [
  {
    path: '',
    title: 'Syncio',
    loadChildren: () =>
      import('./features/user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'admin',
    title: 'Administration | Syncio',
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'login',
    title: 'Login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    title: 'Signup',
    component: SignupComponent,
  },
];

@NgModule({
  declarations: [
    LoginComponent, // the component where you're using [(ngModel)]
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    ToastModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
