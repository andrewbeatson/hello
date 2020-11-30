import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimesheetsPageRoutingModule } from './new-timesheet-routing.module';

import { TimesheetsPage } from './new-timesheet.page';
import { SharedModule } from 'src/app/directives/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TimesheetsPageRoutingModule,
    SharedModule,
  ],
  declarations: [TimesheetsPage],
})
export class TimesheetsPageModule {}
