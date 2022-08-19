import {CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
<<<<<<< HEAD:src/app/home/home.module.ts
import { SharedModule} from '../shared';
import { PrivacyPoliceComponent } from './privacy-police/privacy-police.component';
=======
import { SharedModule} from '../../shared';
>>>>>>> e22c5f780c941d2979066859001d6ccef20276fb:src/app/components/home/home.module.ts

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
