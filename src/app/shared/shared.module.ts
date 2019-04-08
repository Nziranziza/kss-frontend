import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {
  ListErrorsComponent,
  HomeHeaderComponent,
  HomeFooterComponent,
  ListMessageComponent,

} from './layout';
import {MatDialogModule, MatIconModule} from '@angular/material';
import {ConfirmDialogComponent} from './layout';
import {DataTablesModule} from 'angular-datatables';
import {RequiredRolesDirective} from './directives/required-roles';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule, MatIconModule, MatDialogModule, DataTablesModule
  ],
  declarations: [ListErrorsComponent,
    HomeHeaderComponent, HomeFooterComponent, ListMessageComponent, ConfirmDialogComponent, RequiredRolesDirective],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ListErrorsComponent,
    ListMessageComponent,
    HomeHeaderComponent,
    HomeFooterComponent,
    ConfirmDialogComponent,
    MatIconModule, MatDialogModule, DataTablesModule, RequiredRolesDirective
  ],
  entryComponents: [ConfirmDialogComponent]
})
export class SharedModule {
}
