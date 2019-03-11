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
import {ConfirmDialogComponent} from './layout/confirm-dialog/confirm-dialog.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule, MatIconModule, MatDialogModule
  ],
  declarations: [ListErrorsComponent,
    HomeHeaderComponent, HomeFooterComponent, ListMessageComponent, ConfirmDialogComponent],
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
    ConfirmDialogComponent
  ],
  entryComponents: [ConfirmDialogComponent]
})
export class SharedModule {
}
