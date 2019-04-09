import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginModule} from './login/login.module';
import {AppRoutingModule} from './app-routing.module';
import {AdminModule} from './admin/admin.module';
import {HomeModule} from './home/home.module';
import {CoreModule} from './core';
import {SharedModule} from './shared';

import {DataService} from './data.service';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {OrganisationModule} from './organisation/organisation.module';
import {ProfileModule} from './profile/profile.module';

import {FarmerModule} from './farmer/farmer.module';
import {RegistrationReportModule} from './registration-report/registration-report.module';
import {RouterModule} from '@angular/router';
import {UserModule} from './user/user.module';
import {OrganisationTypeModule} from './organisation-type/organisation-type.module';
import {DataTablesModule} from 'angular-datatables';


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
    RegistrationReportModule,
    ProfileModule,
    RouterModule,
    UserModule,
    OrganisationTypeModule,
    DataTablesModule,
    /*HttpClientInMemoryWebApiModule.forRoot(DataService)*/
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule {
}
