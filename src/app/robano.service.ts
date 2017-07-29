/**
 * Created by pooyasaberian on 7/24/17.
 */

import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {RobanoGroupChannel} from './robano-group-channel';
import 'rxjs/add/operator/toPromise';
import {SessionManager} from './session-manager.service';
import {RobanoMessage} from './robano-message';

@Injectable()
export class RobanoService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private baseUrl = 'http://api.robano.me/v2.0/';
  constructor(private http: Http, private sessionManager: SessionManager) {
    try {
      const token = this.sessionManager.retrieve('access_token');
      this.headers.set('Chat-Token', token);
    } catch (e) {}
  }
  setAccessToken(token: string) {
    this.headers.set('Chat-Token', token);
  }
  getGroupChannels(): Promise<RobanoGroupChannel[]> {
    return this.http.get(this.baseUrl + 'chat/channels', {headers: this.headers})
      .toPromise()
      .then(response => response.json().channels as RobanoGroupChannel[])
      .catch(this.handleError);
  }
  getGroupChannel(url: string): Promise<RobanoGroupChannel> {
    return this.http.get(this.baseUrl + 'chat/channels/' + url, {headers: this.headers})
      .toPromise()
      .then(response => response.json().channel as RobanoGroupChannel)
      .catch(this.handleError);
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  loadChannelPreviousMessages(channel: RobanoGroupChannel): Promise<BaseMessage[]> {
    console.log('loadChannelPreviousMessages', channel.previousMessageListQuery);
    if (!channel.previousMessageListQuery) {
      channel.previousMessageListQuery = channel.groupChannel.createPreviousMessageListQuery();
    }
    return new Promise(resolver => {
      channel.previousMessageListQuery.load(100, true, function (messageList, error) {
        if (error) {
          console.error(error);
          resolver(null);
          return;
        }
        resolver(messageList);
      });
    });
  }
  sendMessage(channelType: string, channelUrl: string, message: RobanoMessage): Promise<Object> {
    console.log('url', this.baseUrl + 'chat/channels/' + channelType + '/' + channelUrl + '/messages', message);
    return this.http.post(this.baseUrl + 'chat/channels/' + channelType + '/' + channelUrl + '/messages', message, {headers: this.headers})
      .toPromise()
      .then(response => response.json() as Object)
      .catch(this.handleError);
  }
}
