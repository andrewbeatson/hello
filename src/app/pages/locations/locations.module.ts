import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LocationsPageRoutingModule } from './locations-routing.module';
import { LocationsPage } from './locations.page';
import { SharedModule } from 'src/app/directives/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationsPageRoutingModule,
    SharedModule,
  ],
  declarations: [LocationsPage],
})
export class LocationsPageModule {}
