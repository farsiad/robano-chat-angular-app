/**
 * Created by pooyasaberian on 7/25/17.
 */

import {Injectable} from '@angular/core';

@Injectable()
export class SessionManager {

  store(key: string, content: Object) {
    localStorage.setItem(key, JSON.stringify(content));
  }

  retrieve(key: string) {
    const val = localStorage.getItem(key);
    if (!val) {
      throw new Error('not found');
    }
    return JSON.parse(val);
  }
}
