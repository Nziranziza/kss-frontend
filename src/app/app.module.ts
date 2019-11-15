import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {LoginModule} from './login/login.module';
import {AppRoutingModule} from './app-routing.module';
import {AdminModule} from './admin/admin.module';
import {HomeModule} from './home/home.module';
import {CoreModule} from './core';
import {SharedModule} from './shared';
import {OrganisationModule} from './organisation/organisation.module';
import {ProfileModule} from './profile/profile.module';
import {FarmerModule} from './farmer/farmer.module';
import {ReportModule} from './reports/report.module';
import {RouterModule} from '@angular/router';
import {UserModule} from './user/user.module';
import {DataTablesModule} from 'angular-datatables';
import {OrganisationTypeModule} from './organisation-type/organisation-type.module';
import {CherrySupplyModule} from './cherry-supply/cherry-supply.module';
import {SettingsModule} from './settings/settings.module';
import {ParchmentModule} from './parchment/parchment.module';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {ErrorPagesModule} from './error-pages/error-pages.module';
import {DryProcessingModule} from './dry-processing/dry-processing.module';
import {InputDistributionModule} from './input-distribution/input-distribution.module';
import {SitesModule} from './input-distribution/sites/sites.module';
import {WarehouseModule} from './input-distribution/warehouse/warehouse.module';
import {DatePipe} from '@angular/common';

/*import {DataService} from './data.service';
  import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';*/

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LoginModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    AdminModule,
    HomeModule,
    OrganisationModule,
    FarmerModule,
    ReportModule,
    ProfileModule,
    RouterModule,
    UserModule,
    OrganisationTypeModule,
    CherrySupplyModule,
    SettingsModule,
    ParchmentModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    DryProcessingModule,
    InputDistributionModule,
    SitesModule,
    ErrorPagesModule,
    DataTablesModule,
    WarehouseModule
    /*HttpClientInMemoryWebApiModule.forRoot(DataService)*/
  ],
  providers: [Title, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {
}
