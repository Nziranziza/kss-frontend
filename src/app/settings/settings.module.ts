import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SettingsRoutingModule} from './settings-routing.module';
import {SeasonParametersComponent} from './season-parameters/season-parameters.component';
import {CreateSeasonComponent} from './season-parameters/create-season/create-season.component';
import {EditSeasonComponent} from './season-parameters/edit-season/edit-season.component';
import {SharedModule} from '../shared';
import {CoffeeTypeComponent} from './coffee-type/coffee-type.component';
import {CoffeeTypeCreateComponent} from './coffee-type/coffee-type-create/coffee-type-create.component';
import {DistributionParametersComponent} from './distribution-parameters/distribution-parameters.component';
import {EditInputComponent} from './distribution-parameters/edit-input/edit-input.component';
import {EditSupplierComponent} from './distribution-parameters/edit-supplier/edit-supplier.component';
import {ChannelComponent} from './channel/channel-create/channel.component';
import { ChannelListComponent } from './channel/channel-list/channel-list.component';
import { ChannelEditComponent } from './channel/channel-edit/channel-edit.component';


@NgModule({
  declarations: [SeasonParametersComponent, CreateSeasonComponent, EditSeasonComponent, ChannelComponent,
    CoffeeTypeComponent, CoffeeTypeCreateComponent, DistributionParametersComponent, EditInputComponent,
    EditSupplierComponent,
    ChannelListComponent,
    ChannelEditComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule
  ],
  entryComponents: [CreateSeasonComponent, EditSeasonComponent, EditSupplierComponent, EditInputComponent]
})
export class SettingsModule {
}
