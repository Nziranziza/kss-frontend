import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { PrivacyPoliceComponent } from './privacy-police/privacy-police.component';
import { SharedModule} from '../../shared';


@NgModule({
    declarations: [HomeComponent, PrivacyPoliceComponent],
    imports: [
        CommonModule,
        HomeRoutingModule,
        SharedModule
    ]
})
export class HomeModule { }
