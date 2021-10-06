import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {
  ListErrorsComponent,
  HomeHeaderComponent,
  HomeFooterComponent,
  ListMessageComponent

} from './layout';
import {MatDialogModule, MatIconModule} from '@angular/material';
import {ConfirmDialogComponent} from './layout';
import {DataTablesModule} from 'angular-datatables';
import {RequiredRolesDirective} from './directives/required-roles.directive';
import {LoaderComponent} from './layout';
import {RequiredSeasonDirective} from './directives/required-season.directive';
import {HasPermissionDirective} from './directives/has-permission.directive';
import {QuantityUnitComponent} from './layout';
import {ListWarningsComponent} from './layout';
import {DownloaderComponent} from './layout';
import {SpinnerComponent } from './layout';
import {InternalDirective} from './directives/internal.directives';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule, MatIconModule, MatDialogModule, DataTablesModule

  ],
  declarations: [ListErrorsComponent, LoaderComponent,
    HomeHeaderComponent, HomeFooterComponent, ListMessageComponent,
    ConfirmDialogComponent, RequiredRolesDirective, InternalDirective, LoaderComponent,
    RequiredSeasonDirective, HasPermissionDirective, QuantityUnitComponent, ListWarningsComponent, DownloaderComponent, SpinnerComponent],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ListErrorsComponent,
    ListMessageComponent,
    ListWarningsComponent,
    SpinnerComponent,
    HomeHeaderComponent,
    LoaderComponent,
    HomeFooterComponent,
    ConfirmDialogComponent,
    QuantityUnitComponent,
    DownloaderComponent,
    MatIconModule, MatDialogModule,
    DataTablesModule, RequiredRolesDirective,
    RequiredSeasonDirective, HasPermissionDirective, InternalDirective
  ],
  entryComponents: [ConfirmDialogComponent]
})
export class SharedModule {
}
