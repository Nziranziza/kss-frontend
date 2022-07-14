import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {LoginModule} from './components/authentication/login.module';
import {AppRoutingModule} from './app-routing.module';
import {AdminModule} from './components/admin/admin.module';
import {HomeModule} from './components/home/home.module';
import {CoreModule} from './core';
import {SharedModule} from './shared';
import {OrganisationModule} from './components/organisation/organisation.module';
import {ProfileModule} from './components/profile/profile.module';
import {FarmerModule} from './components/farmer/farmer.module';
import {ReportModule} from './components/reports/report.module';
import {RouterModule} from '@angular/router';
import {UserModule} from './components/user/user.module';
import {DataTablesModule} from 'angular-datatables';
import {OrganisationTypeModule} from './components/organisation-type/organisation-type.module';
import {CherrySupplyModule} from './components/wet-processing/cherry-supply/cherry-supply.module';
import {SettingsModule} from './components/settings/settings.module';
import {ParchmentModule} from './components/wet-processing/parchment/parchment.module';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime-ex';
import {ErrorPagesModule} from './components/error-pages/error-pages.module';
import {DryProcessingModule} from './components/dry-processing/dry-processing.module';
import {InputDistributionModule} from './components/input-distribution/input-distribution.module';
import {SitesModule} from './components/input-distribution/sites/sites.module';
import {WarehouseModule} from './components/input-distribution/warehouse/warehouse.module';
import {DatePipe} from '@angular/common';
import {PaymentsModule} from './components/payments/payments.module';
import {OrganisationPayFarmersModule} from './components/payments/organisation-pay-farmers/organisation-pay-farmers.module';
import {FarmModule} from './components/farm/farm.module';
import {ExtensionServicesModule} from './components/extension-services/extension-services.module';

/*import {DataService} from './data.service';
  import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';*/

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    LoginModule,
    PaymentsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    FarmModule,
    AdminModule,
    HomeModule,
    OrganisationModule,
    FarmerModule,
    ExtensionServicesModule,
    ReportModule,
    ProfileModule,
    RouterModule,
    UserModule,
    OrganisationTypeModule,
    CherrySupplyModule,
    SettingsModule,
    ParchmentModule,
    OrganisationPayFarmersModule,
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
