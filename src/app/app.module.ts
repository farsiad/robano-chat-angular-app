import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {GroupChannelsComponent} from './group-channels.component';
import {SendBirdService} from './sendbird.service';
import {RobanoService} from './robano.service';
import {HttpModule} from '@angular/http';
import {JalaliPipe} from './jalali.pipe';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppRoutingModule } from './app-routing.module';
import {GroupChannelComponent} from './group-channel.component';
import {FormsModule} from '@angular/forms';
import {SessionManager} from './session-manager.service';

@NgModule({
  declarations: [
    AppComponent,
    GroupChannelsComponent,
    GroupChannelComponent,
    JalaliPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    SendBirdService,
    RobanoService,
    SessionManager
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);
