/**
 * Created by pooyasaberian on 7/23/17.
 */

import { Injectable } from '@angular/core';
import 'sendbird';

@Injectable()
export class SendBirdService {
  sendBird: SendBird_Instance;
  constructor() {
    this.sendBird = new SendBird({
      appId: 'D4DB2E08-7358-4012-BA94-6D116250E67A'
    });
  }
  getSendBirdInstance(): SendBird_Instance {
    return this.sendBird;
  }
  connect(userId: string): Promise<User> {
    return new Promise(resolver => {
      this.sendBird.connect(userId, function(user, error) {
        if (error) {
          resolver(null);
          return;
        }
        resolver(user);
      });
    });
  }
  getGroupChannels(): Promise<GroupChannel[]> {
    return new Promise(resolver => {
      let groupChannelListQuery: GroupChannelListQuery;
      groupChannelListQuery = this.sendBird.GroupChannel.createMyGroupChannelListQuery();
      groupChannelListQuery.includeEmpty = false;
      groupChannelListQuery.limit = 100;
      if (groupChannelListQuery.hasNext) {
        groupChannelListQuery.next(function(channelList, error){
          if (error) {
            console.error(error);
            resolver(null);
            return;
          }
          resolver(channelList);
        });
      }
    });
  }
  getGroupChannel(url: string): Promise<GroupChannel> {
    return new Promise(resolver => {
      this.sendBird.GroupChannel.getChannel(url, function(channel, error) {
        if (error) {
          console.error(error);
          resolver(null);
          return;
        }
        resolver(channel);
      });
    });
  }
  sendMessage(channel: GroupChannel, newMessage: string): Promise<UserMessage> {
    return new Promise(resolver => {
      channel.sendUserMessage(newMessage, null, null, function(message, error){
        if (error) {
          console.error(error);
          resolver(null);
          return;
        }
        resolver(message);
      });
    });
  }
}
