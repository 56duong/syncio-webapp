import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/authentication/login/login.component';
import { ForgotpasswordComponent } from './features/authentication/forgotpassword/forgotpassword.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ChangePasswordComponent } from './features/authentication/changepassword/changepassword.component';
import { AdminComponent } from './features/admin/admin.component';
import { SearchComponent } from './features/user/user-home/search/search.component';
import { PrimengModule } from './primeng/primeng.module';
import { RegisterComponent } from './features/authentication/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { RoleEnum } from './core/interfaces/user';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { NotAuthorizedComponent } from './shared/components/not-authorized/not-authorized.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from "./shared/shared.module";
import { UpdateIpComponent } from './shared/components/update-ip/update-ip.component';
import { environment } from 'src/environments/environment';

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
    canActivate: [authGuard],
    data: { requiredRoles: [RoleEnum.ADMIN] }
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
  { path: 'search', component: SearchComponent },
  {
    path: "not-found",
    title: "Not Found",
    component: NotFoundComponent
  },
  {
    path: "not-authorized",
    title: "Not Authorized",
    component: NotAuthorizedComponent
  },
  {
    path: "update-ip",
    title: "Update IP",
    component: UpdateIpComponent
  }
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
    RouterModule.forRoot(routes, { useHash: environment.windows ? true : false }), // useHash(#) for Windows app
    ToastModule,
    DialogModule,
    PrimengModule,
    TranslateModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
