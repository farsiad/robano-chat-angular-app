import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GroupChannelsComponent} from './group-channels.component';
import {GroupChannelComponent} from './group-channel.component';

const routes: Routes = [
  { path: '', redirectTo: '/im', pathMatch: 'full' },
  { path: 'im',  component: GroupChannelsComponent },
  { path: 'channels/:channel_url',  component: GroupChannelComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
