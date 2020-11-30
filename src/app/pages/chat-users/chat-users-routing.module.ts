import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatUsersPage } from './chat-users.page';

const routes: Routes = [
  {
    path: '',
    component: ChatUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatUsersPageRoutingModule {}
