/**
 * Created by pooyasaberian on 7/24/17.
 */

import {Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, AfterViewChecked} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';
import {SendBirdService} from './sendbird.service';
import {RobanoService} from './robano.service';
import {RobanoGroupChannel} from './robano-group-channel';
import {SessionManager} from "./session-manager.service";
import {RobanoMessage} from "./robano-message";

@Component({
  selector: 'app-group-channel',
  templateUrl: './group-channel.component.html'
})

export class GroupChannelComponent implements OnInit, AfterViewInit, AfterViewChecked, ChannelHandler_Instance {
  channelUrl: string;
  sub: any;
  robanoGroupChannel: RobanoGroupChannel;
  messages: any[] = [];
  imHistoryWrapHeight: number;
  needToScrollButton = true;
  newImMessage = '';
  isSendingMessage = false;
  isTyping = false;
  isLoading = true;
  userId: string;
  @ViewChild('imBottomPanelWrap') imBottomPanelWrapView: ElementRef;
  @ViewChild('imHistoryWrap') imHistoryWrap: ElementRef;
  @ViewChild('newImMessageElem') newImMessageElem: ElementRef;
  @HostListener('window:resize') onResize() {
    if (this.imHistoryWrapHeight) {
      this.imHistoryWrapHeight = window.innerHeight - this.imBottomPanelWrapView.nativeElement.offsetHeight - 46;
    }
  }
  constructor(
    private sessionManager: SessionManager,
    private sendBirdService: SendBirdService,
    private robanoService: RobanoService,
    private route: ActivatedRoute,
    private location: Location) {
    this.imHistoryWrapHeight = 100;
    try {
      this.userId = this.sessionManager.retrieve('user_id');
    } catch (e) {}
  }
  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.channelUrl = params['channel_url'];
      if (params['token']) {
        this.sessionManager.store('access_token',  params['token']);
        this.robanoService.setAccessToken(params['token']);
      }
      if (params['user_id']) {
        this.userId = params['user_id'];
        this.sessionManager.store('user_id', this.userId);
      }
    });
    console.log('GroupChannelComponent: getConnectionState', this.sendBirdService.getSendBirdInstance().getConnectionState());
    if (this.sendBirdService.getSendBirdInstance().getConnectionState() === 'CLOSED') {
      this.sendBirdService.connect(this.userId)
        .then(user => {
          this.initRobanoChannel();
        });
    } else {
      this.initRobanoChannel();
    }
  }
  ngAfterViewInit() {
    if (this.imBottomPanelWrapView && this.imHistoryWrapHeight) {
      this.imHistoryWrapHeight = window.innerHeight - this.imBottomPanelWrapView.nativeElement.offsetHeight - 46;
    }
  }
  ngAfterViewChecked() {
    if (this.needToScrollButton) {
      this.scrollToBottom();
    }
  }
  initRobanoChannel() {
    this.robanoService.getGroupChannel(this.channelUrl)
      .then(robanoChannel => {
        this.sendBirdService.getGroupChannel(this.channelUrl)
          .then(sendBirdChannel => {
            robanoChannel.groupChannel = sendBirdChannel;
            this.robanoGroupChannel = robanoChannel;
            console.log(this.robanoGroupChannel);
            this.sendBirdService.getSendBirdInstance().removeAllChannelHandlers();
            this.sendBirdService.getSendBirdInstance().addChannelHandler(this.robanoGroupChannel.channelUrl + '_handler', this);
            if (this.imHistoryWrapHeight) {
              this.imHistoryWrapHeight = window.innerHeight - this.imBottomPanelWrapView.nativeElement.offsetHeight - 46;
            }
            this.robanoService.loadChannelPreviousMessages(this.robanoGroupChannel)
              .then(messages => {
                this.messages = this.messages.concat(messages.reverse());
                this.needToScrollButton = true;
                this.isLoading = false;
                this.robanoGroupChannel.groupChannel.markAsRead();
                console.log('messages', this.messages);
              });
          });
      });
  }
  goBack() {
    this.location.back();
  }
  imSendFormSubmit() {
    if (this.newImMessage && this.newImMessage.trim().length > 0) {
      this.isSendingMessage = true;
      this.sendBirdService.sendMessage(this.robanoGroupChannel.groupChannel, this.newImMessage.trim())
        .then(message => {
          this.isSendingMessage = false;
          this.newImMessageElem.nativeElement.innerText = null;
          if (message) {
            let messageExists = false;
            this.messages.forEach(function(_message) {
              if (_message.messageId === message.messageId) {
                messageExists = true;
                return;
              }
            });
            if (!messageExists) {
              this.messages.push(message);
            }
            this.newImMessage = null;
            this.needToScrollButton = true;
            const robanoMessage = new RobanoMessage();
            robanoMessage.messageType = message.messageType;
            robanoMessage.message = message.message;
            robanoMessage.customType = message.customType;
            robanoMessage.data = message.data;
            robanoMessage.markAsRead = true;
            robanoMessage.source = 'web';
            console.log('robanoMessage', robanoMessage);
            this.robanoService.sendMessage('group_channels', this.robanoGroupChannel.channelUrl, robanoMessage)
              .then(response => {
                console.log(response);
              });
          }
        });
    }
  }
  onMessageReceived(channel: GroupChannel|OpenChannel, message: AdminMessage|UserMessage): void {
    if (channel.url === this.robanoGroupChannel.channelUrl) {
      let messageExists = false;
      this.messages.forEach(function(_message) {
        if (_message.messageId === message.messageId) {
          messageExists = true;
          return;
        }
      });
      if (!messageExists) {
        this.messages.push(message);
        this.needToScrollButton = true;
        this.robanoGroupChannel.groupChannel.markAsRead();
      }
    }
    console.log('channel', channel);
    console.log('newMessage', message);
  }
  onMessageDeleted(channel: GroupChannel, messageId: number): void {}
  onReadReceiptUpdated(channel: GroupChannel): void {}
  onTypingStatusUpdated(channel: GroupChannel): void {
    this.isTyping = channel.url === this.robanoGroupChannel.channelUrl && channel.isTyping();
  }
  onUserJoined(channel: GroupChannel, user: User): void {}
  onUserLeft(channel: GroupChannel, user: User): void {}
  onUserEntered(channel: OpenChannel, user: User): void {}
  onUserExited(channel: OpenChannel, user: User): void {}
  onUserMuted(channel: OpenChannel, user: User): void {}
  onUserUnmuted(channel: OpenChannel, user: User): void {}
  onUserBanned(channel: OpenChannel, user: User): void {}
  onUserUnbanned(channel: OpenChannel, user: User): void {}
  onChannelFrozen(channel: OpenChannel): void {}
  onChannelUnfrozen(channel: OpenChannel): void {}
  onChannelChanged(channel: OpenChannel|GroupChannel): void {}
  onChannelDeleted(channelUrl: string): void {}
  onUserReceivedInvitation(channel: GroupChannel, inviter: User, invitees: Array<Member>): void {}
  onUserDeclinedInvitation(channel: GroupChannel, inviter: User, invitee: Array<Member>): void {}

  scrollToBottom() {
    if (this.imHistoryWrap) {
      this.imHistoryWrap.nativeElement.scrollTop = this.imHistoryWrap.nativeElement.scrollHeight;
      this.needToScrollButton = false;
    }
  }
}
