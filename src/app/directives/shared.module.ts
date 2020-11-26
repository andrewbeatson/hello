import { NgModule } from '@angular/core';
import { HidenavModule } from './hidenav.module';
import { CommonModule } from '@angular/common';
@NgModule({
  imports: [HidenavModule, CommonModule],
  exports: [HidenavModule],
})
export class SharedModule {}
