import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentChannelService {

  constructor(private apiService: ApiService) {
  }

  createChannel(body: any): Observable<any> {
    return this.apiService.post('/paymentchannel', body);
  }

}
