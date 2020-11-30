import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatUsersPageRoutingModule } from './chat-users-routing.module';

import { ChatUsersPage } from './chat-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatUsersPageRoutingModule
  ],
  declarations: [ChatUsersPage]
})
export class ChatUsersPageModule {}
