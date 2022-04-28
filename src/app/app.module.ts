import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {LoginModule} from './authentication/login.module';
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
import {CherrySupplyModule} from './wet-processing/cherry-supply/cherry-supply.module';
import {SettingsModule} from './settings/settings.module';
import {ParchmentModule} from './wet-processing/parchment/parchment.module';
import {OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng-pick-datetime';
import {ErrorPagesModule} from './error-pages/error-pages.module';
import {DryProcessingModule} from './dry-processing/dry-processing.module';
import {InputDistributionModule} from './input-distribution/input-distribution.module';
import {SitesModule} from './input-distribution/sites/sites.module';
import {WarehouseModule} from './input-distribution/warehouse/warehouse.module';
import {DatePipe} from '@angular/common';
import {PaymentsModule} from './payments/payments.module';
import {OrganisationPayFarmersModule} from './payments/organisation-pay-farmers/organisation-pay-farmers.module';
import { TreesVarietyListComponent } from './farm/trees-variety/trees-variety-list/trees-variety-list.component';
import { TreesVarietyCreateComponent } from './farm/trees-variety/trees-variety-create/trees-variety-create.component';
import { TreesVarietyEditComponent } from './farm/trees-variety/trees-variety-edit/trees-variety-edit.component';

/*import {DataService} from './data.service';
  import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';*/

@NgModule({
  declarations: [
    AppComponent,
    TreesVarietyListComponent,
    TreesVarietyCreateComponent,
    TreesVarietyEditComponent
  ],
  imports: [
    BrowserModule,
    LoginModule,
    PaymentsModule,
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
