import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/authentication/login/login.component';
import { ForgotpasswordComponent } from './features/authentication/forgotpassword/forgotpassword.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ChangePasswordComponent } from './features/authentication/changepassword/changepassword.component';
import { AdminComponent } from './features/admin/admin.component';

// import { ProfileFormComponent } from './features/user/user-home/profile-form/profile-form.component';
import { SearchComponent } from './features/user/user-home/search/search.component';
import { PrimengModule } from './primeng/primeng.module';
import { RegisterComponent } from './features/authentication/register/register.component';


@NgModule({
  declarations: [
    // your components
  ],
  imports: [
    // other modules
    ToastModule,
    DialogModule,
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
    component: AdminComponent,
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'login',
    title: 'Login',
    component: LoginComponent,
  },
  {
    path: 'register',
    title: 'Register',
    component: RegisterComponent,
  },
  {
    path: 'forgot_password',
    title: 'forgot',
    component: ForgotpasswordComponent,
  },
  {
    path: 'reset_password',
    title: 'reset_password',
    component: ChangePasswordComponent,
  },
  {
    path: 'confirm-user-register',
    title: 'confirm-user-register',
    component: LoginComponent,
  },
];

@NgModule({
  declarations: [
    LoginComponent,
    ForgotpasswordComponent,
    ChangePasswordComponent,
    RegisterComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes),
    ToastModule,
    DialogModule,
    PrimengModule
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
