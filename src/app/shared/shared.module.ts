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

} from './layouts';
import { MatIconModule} from '@angular/material/icon';
import {MatDialogModule } from '@angular/material/dialog';
import {DataTablesModule} from 'angular-datatables';
import {RequiredRolesDirective} from './directives/required-roles.directive';
import {LoaderComponent} from './layouts';
import {RequiredSeasonDirective} from './directives/required-season.directive';
import {HasPermissionDirective} from './directives/has-permission.directive';
import {QuantityUnitComponent} from './layouts';
import {ListWarningsComponent} from './layouts';
import {DownloadingComponent} from './layouts';
import {SpinnerComponent } from './layouts';
import {InternalDirective} from './directives/internal.directives';
import {RequiredSeasonCherryDirective} from './directives/required-season-cherry.directive';
import {DebounceClickDirective} from './directives/debounce-click.directive';
import { LoadingComponent } from './layouts/loading/loading.component';
import {InlineErrorsComponent} from './layouts/inline-errors/inline-errors.component';
import { ConfirmModalComponent } from './layouts';
import { SuccessModalComponent } from './layouts';
import {GoogleChartsModule} from 'angular-google-charts';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/compiler';

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
    RequiredRolesDirective, InternalDirective, LoaderComponent,
    RequiredSeasonDirective, RequiredSeasonCherryDirective, HasPermissionDirective,
    DebounceClickDirective,
    QuantityUnitComponent, ListWarningsComponent,
    InlineErrorsComponent,
    DownloadingComponent, SpinnerComponent, LoadingComponent, ConfirmModalComponent, ConfirmModalComponent, SuccessModalComponent],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ListErrorsComponent,
    InlineErrorsComponent,
    ListMessageComponent,
    ListWarningsComponent,
    SpinnerComponent,
    HomeHeaderComponent,
    LoaderComponent,
    HomeFooterComponent,
    ConfirmModalComponent,
    SuccessModalComponent,
    QuantityUnitComponent,
    DownloadingComponent,
    MatIconModule, MatDialogModule,
    DataTablesModule, RequiredRolesDirective,
    RequiredSeasonDirective,
    HasPermissionDirective, InternalDirective,
    RequiredSeasonCherryDirective,
    InlineErrorsComponent, InlineErrorsComponent
  ],
  entryComponents: [ConfirmModalComponent, SuccessModalComponent]
})
export class SharedModule {
}
