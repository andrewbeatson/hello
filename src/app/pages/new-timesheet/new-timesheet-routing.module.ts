import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetsPage } from './new-timesheet.page';

const routes: Routes = [
  {
    path: '',
    component: TimesheetsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimesheetsPageRoutingModule {}
