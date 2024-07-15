import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpCenterRoutingModule } from './help-center-routing.module';
import { HelpCenterComponent } from './help-center.component';
import { PanelModule } from 'primeng/panel';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { HelpSidebarComponent } from './help-sidebar/help-sidebar.component';
import { FeaturesComponent } from './features/features.component';
import { AccountSettingComponent } from './account-setting/account-setting.component';
import { ButtonModule } from 'primeng/button';
import { PrivacySecurityReportingComponent } from './privacy-security-reporting/privacy-security-reporting.component';
@NgModule({
  declarations: [
    HelpCenterComponent,
    HelpSidebarComponent,
    FeaturesComponent,
    AccountSettingComponent,
    PrivacySecurityReportingComponent,
  ],
  imports: [
    CommonModule,
    HelpCenterRoutingModule,
    PanelMenuModule,
    PanelModule,
    MenuModule, 
    PanelMenuModule,
    ButtonModule 
  ]
})
export class HelpCenterModule { }
