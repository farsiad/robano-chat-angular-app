/**
 * Created by pooyasaberian on 7/23/17.
 */

import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import { SendBirdService } from './sendbird.service';
import {RobanoService} from './robano.service';
import {RobanoGroupChannel} from './robano-group-channel';
import {ActivatedRoute, Router} from '@angular/router';
import {SessionManager} from './session-manager.service';

@Component({
  selector: 'app-group-channels',
  templateUrl: './group-channels.component.html'
})

export class GroupChannelsComponent implements OnInit, AfterViewInit {
  groupChannels: GroupChannel[];
  sub: any;
  robanoGroupChannels: RobanoGroupChannel[] = [];
  channelHandler: ChannelHandler_Instance;
  imDialogsColHeight: number;
  isLoading = true;
  userId: string;
  @HostListener('window:resize') onResize() {
    this.imDialogsColHeight = window.innerHeight - 46;
  }
  constructor(
    private sessionManager: SessionManager,
    private sendBirdService: SendBirdService,
    private route: ActivatedRoute,
    private robanoService: RobanoService
  ) {
    this.imDialogsColHeight = 0;
    try {
      this.userId = this.sessionManager.retrieve('user_id');
    } catch (e) {}
  }
  getGroupChannels(): void {
    this.robanoGroupChannels = [];
    this.robanoService.getGroupChannels()
      .then(robanoChannels => {
        console.log(robanoChannels);
        this.sendBirdService.getGroupChannels()
          .then(sendBirdChannels => {
            if (sendBirdChannels) {
              console.log(sendBirdChannels);
              sendBirdChannels.forEach(function(sendBirdChannel) {
                robanoChannels.forEach(function (robanoChannel) {
                  if (sendBirdChannel.url === robanoChannel.channelUrl) {
                    robanoChannel.groupChannel = sendBirdChannel;
                    this.robanoGroupChannels.push(robanoChannel);
                  }
                }, this);
              }, this);
              this.isLoading = false;
            }
          });
      });
  }
  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      if (params['token']) {
        this.sessionManager.store('access_token',  params['token']);
        this.robanoService.setAccessToken(params['token']);
      }
      if (params['user_id']) {
        this.userId = params['user_id'];
        this.sessionManager.store('user_id', this.userId);
      }
    });
    console.log('ngOnInit', 'GroupChannelsComponent');
    console.log('GroupChannelsComponent: getConnectionState', this.sendBirdService.getSendBirdInstance().getConnectionState());
    if (this.sendBirdService.getSendBirdInstance().getConnectionState() === 'CLOSED') {
      this.sendBirdService.connect(this.userId)
        .then(user => {
          console.log('GroupChannelsComponent: user', user);
          this.getGroupChannels();
        });
    } else {
      this.getGroupChannels();
    }
  }
  ngAfterViewInit() {
    this.imDialogsColHeight = window.innerHeight - 46;
  }
}
