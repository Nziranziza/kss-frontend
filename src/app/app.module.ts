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
    HttpClientInMemoryWebApiModule.forRoot(
      DataService, {dataEncapsulation: false}
    )
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule {
}
