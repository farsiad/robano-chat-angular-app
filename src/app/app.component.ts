import {Component, OnInit} from '@angular/core';
import {SendBirdService} from "./sendbird.service";
import {SessionManager} from "./session-manager.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  constructor(
    private sessionManager: SessionManager,
    private sendBirdService: SendBirdService
  ) {
  }
  ngOnInit(): void {
    console.log('ngOnInit', 'AppComponent');
    if (this.sendBirdService.getSendBirdInstance().getConnectionState() === 'CLOSED') {
      try {
        this.sendBirdService.connect(this.sessionManager.retrieve('user_id'))
          .then(user => {
            console.log('AppComponent: user', user);
          });
      } catch (e) {}
    }
    console.log('AppComponent: getConnectionState', this.sendBirdService.getSendBirdInstance().getConnectionState());
  }
}
