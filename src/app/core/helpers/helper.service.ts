import {Injectable} from '@angular/core';
import {ValidationErrors} from '@angular/forms';
import {LocationService} from '../services';
import {DatePipe} from '@angular/common';
import {constant} from '../../../environments/constant';
import * as moment from 'moment-timezone';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private locationService: LocationService,
    private datePipe: DatePipe,
    private translate: TranslateService
  ) {
  }

  activeOrganisationEPaymentChannel = [2];
  activeFarmerEPaymentChannel = [2];
  activeFarmerReceivingPaymentChannel = [4, 2];


  getFormValidationErrors(form) {
    const errors = [];
    Object.keys(form.controls).forEach(key => {
      const controlErrors: ValidationErrors = form.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          errors.push(key + ' field is ' + keyError);
        });
      } else {
        if (errors.length === 0) {
          errors.push('Wrong or missing required information');
        }
      }
    });
    return errors;
  }

  cleanObject (obj) {
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const isEmptyObject = JSON.stringify(obj[key]) === "{}";
        if (typeof obj[key] === "object" && obj !== null && !isEmptyObject) {
          obj[key] = this.cleanObject(obj[key]);
        }
        const isNullable =
          obj[key] === "" ||
          obj[key] === undefined ||
          obj[key] === null ||
          isEmptyObject;
        if (isNullable) {
          delete obj[key];
        }
      });
    }
    return obj;
  }

  getProvinceName(id: string) {
    this.locationService.getProvinces().subscribe((data) => {
      data = data.filter((element) => {
        return element._id === id;
      });
      return data[0].namek;
    });
  }

  getDistrictName(id: string, district: string) {
    return this.locationService.getDistricts(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === district;
      });
      return data[0].name;
    });

  }

  getSectorName(id: string, sector: string) {
    return this.locationService.getSectors(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === sector;
      });
      return data[0].name;
    });

  }

  getCellName(id: string, cell: string) {
    return this.locationService.getCells(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === cell;
      });
      return data[0].name;
    });
  }

  getVillageName(id: string, village: string) {
    return this.locationService.getVillages(id).subscribe((data) => {
      data = data.filter((element) => {
        return element._id === village;
      });
      return data[0].name;
    });
  }

  getDate(date: string) {
    if (date) {
      return this.datePipe.transform(date, 'yyyy-MM-dd', 'GMT+2');
    } else {
      return null;
    }
  }

  getOrgPossiblePaymentChannels(paymentChannels: any) {
    return paymentChannels.filter((channel) => {
      /* only bank */
      return this.activeOrganisationEPaymentChannel.includes(channel._id);
    });
  }

  getFarmersPossiblePaymentChannels(paymentChannels: any) {
    return paymentChannels.filter((channel) => {
      /* only Ikofi */
      return this.activeFarmerEPaymentChannel.includes(channel._id);
    });
  }

  getFarmersAllPossibleReceivingPaymentChannels(paymentChannels: any) {
    return paymentChannels.filter((channel) => {
      /* not bank */
      return this.activeFarmerReceivingPaymentChannel.includes(channel._id);
    });
  }


  getOrgPossibleSourcePaymentChannels(selectedChannel: number, orgPaymentChannels: any) {
    let result = [];
    if (orgPaymentChannels) {
      switch (+selectedChannel) {
        case 1:
          result = orgPaymentChannels.filter((channel) => {
            return channel.channelId === 1;
          });
          break;
        case 2:
          result = orgPaymentChannels.filter((channel) => {
            return channel.channelId === 2;
          });
          break;
        case 3:
          result = orgPaymentChannels.filter((channel) => {
            return channel.channelId === 3 || channel.channelId === 5;
          });
          break;
        case 4:
          result = orgPaymentChannels.filter((channel) => {
            return channel.channelId === 4;
          });
          break;
      }
    }
    return result;
  }

  getFarmerPossibleReceivingPaymentChannels(selectedPayingChannel: number, farmerPaymentChannels: any) {
    let result = [];
    if (farmerPaymentChannels) {
      switch (+selectedPayingChannel) {
        case 1:
          result = farmerPaymentChannels.filter((channel) => {
            return channel.paymentChannel === 1 && channel.status === 3;
          });
          if (result [0]) {
            result [0]['label'.toString()] = 'AIRTEL';
          }
          break;
        case 2:
          result = farmerPaymentChannels.filter((channel) => {
            return channel.paymentChannel === 2 && channel.status === 3;
          });
          if (result [0]) {
            result [0]['label'.toString()] = 'MTN';
          }
          break;
        case 3:
          result = farmerPaymentChannels.filter((channel) => {
            return channel.paymentChannel === 3 && channel.status === 3;
          });
          if (result [0]) {
            result [0]['label'.toString()] = 'IKOFI';
          }
          break;
        case 5:
          result = farmerPaymentChannels.filter((channel) => {
            return channel.paymentChannel === 3 && channel.status === 3;
          });
          if (result [0]) {
            result [0]['label'.toString()] = 'IKOFI';
          }
          break;
        case 4:
          result = farmerPaymentChannels.filter((channel) => {
            return channel.paymentChannel === 4;
          });
          if (result [0]) {
            result [0]['label'.toString()] = 'CASH';
          }
          break;
      }
    }
    return result;
  }

  setLocalTimeZone(time: string) {
    const momentTimeZone = moment(time);
    return momentTimeZone.tz(constant.timezone).format('YYYY-MM-DD').valueOf();
  }

  translateWord(word: string) {
    let dataValue : string;
    this.translate.get(word).subscribe((data) => {
      dataValue = data;
    });
    return dataValue;
  }
}
