import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LoginModule} from './login/login.module';
import {AppRoutingModule} from './app-routing.module';
import {AdminModule} from './admin/admin.module';
import {HomeModule} from './home/home.module';
import {CoreModule, ErrorInterceptor, HttpTokenInterceptor} from './core';
import {SharedModule} from './shared';

import {DataService} from './data.service';
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {OrganisationModule} from './organisation/organisation.module';
import {ProfileModule} from './profile/profile.module';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {FarmerModule} from './farmer/farmer.module';
import {RegistrationReportModule} from './registration-report/registration-report.module';
import {RouterModule} from '@angular/router';
import {UserModule} from './user/user.module';
import {OrganisationTypeModule} from './organisation-type/organisation-type.module';

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
    OrganisationTypeModule
    /*HttpClientInMemoryWebApiModule.forRoot(DataService)*/
  ],
  providers: [Title, {provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
