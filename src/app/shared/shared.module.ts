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
import {RequiredRolesDirective} from './directives/required-roles';
import {LoaderComponent} from './layout';
import {RequiredSeasonDirective} from './directives/required-season.directive';
import {HasPermissionDirective} from './directives/has-permission.directive';
import {QuantityUnitComponent} from './layout';

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
    ConfirmDialogComponent, RequiredRolesDirective, LoaderComponent,
    RequiredSeasonDirective, HasPermissionDirective, QuantityUnitComponent],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ListErrorsComponent,
    ListMessageComponent,
    HomeHeaderComponent,
    LoaderComponent,
    HomeFooterComponent,
    ConfirmDialogComponent,
    QuantityUnitComponent,
    MatIconModule, MatDialogModule,
    DataTablesModule, RequiredRolesDirective,
    RequiredSeasonDirective, HasPermissionDirective
  ],
  entryComponents: [ConfirmDialogComponent]
})
export class SharedModule {
}
