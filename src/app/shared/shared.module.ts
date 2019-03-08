import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {ListErrorsComponent, HomeHeaderComponent, HomeFooterComponent, ListMessageComponent} from './layout';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule
  ],
  declarations: [ListErrorsComponent,
    HomeHeaderComponent, HomeFooterComponent, ListMessageComponent],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    ListErrorsComponent,
    ListMessageComponent,
    HomeHeaderComponent,
    HomeFooterComponent
  ]
})
export class SharedModule {
}
