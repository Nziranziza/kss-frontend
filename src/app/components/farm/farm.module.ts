import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FarmRoutingModule} from './farm-routing.module';
import {SharedModule} from '../../shared';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxPaginationModule} from 'ngx-pagination';
import {OrderModule} from 'ngx-order-pipe';
import {GoogleChartsModule} from 'angular-google-charts';
import {TreeVarietiesListComponent} from './tree-variety/tree-varieties-list/tree-varieties-list.component';
import {TreeVarietyCreateComponent} from './tree-variety/tree-variety-create/tree-variety-create.component';
import {TreeVarietyEditComponent} from './tree-variety/tree-variety-edit/tree-variety-edit.component';

@NgModule({
    declarations: [TreeVarietiesListComponent, TreeVarietyCreateComponent, TreeVarietyEditComponent],
    imports: [
        CommonModule,
        FarmRoutingModule,
        SharedModule, NgbModule, NgxPaginationModule, OrderModule, GoogleChartsModule
    ]
})
export class FarmModule {
}
