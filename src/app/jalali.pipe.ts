/**
 * Created by pooyasaberian on 7/24/17.
 */

import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'jalali-moment';

@Pipe({
  name: 'jalali'
})
export class JalaliPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const MomentDate = moment(value);
    const MomentToday = moment();
    if (MomentDate.year() === MomentToday.year() && MomentDate.month() === MomentToday.month() && MomentDate.day() === MomentToday.day()) {
     return MomentDate.format('hh:mm A');
    } else {
      return MomentDate.format('jYYYY/jM/jD');
    }
  }
}
