import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TopnavbarComponent} from './topnavbar/topnavbar.component';
import {AsidenavbarComponent} from './asidenavbar/asidenavbar.component';
import {FooternavbarComponent} from './footernavbar/footernavbar.component';
import {SettingnavbarComponent} from './settingnavbar/settingnavbar.component';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    TopnavbarComponent,
    AsidenavbarComponent,
    FooternavbarComponent,
    SettingnavbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    TopnavbarComponent,
    AsidenavbarComponent,
    FooternavbarComponent,
    SettingnavbarComponent
  ]
})
export class LayoutModule {
}
