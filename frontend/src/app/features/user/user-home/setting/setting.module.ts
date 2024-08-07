import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { ImageSearchComponent } from './components/image-search/image-search.component';
import { PrimengModule } from 'src/app/primeng/primeng.module';
import { CoreModule } from 'src/app/core/core.module';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    ImageSearchComponent, 
    ProfileFormComponent
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    PrimengModule,
    CoreModule,
    SharedModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class SettingModule { }
