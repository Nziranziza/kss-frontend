import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { SharedModule} from '../shared';
import { PrivacyPoliceComponent } from './privacy-police/privacy-police.component';

@NgModule({
  declarations: [HomeComponent, PrivacyPoliceComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ],
  entryComponents: [PrivacyPoliceComponent]
})
export class HomeModule { }
