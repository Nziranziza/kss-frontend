import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CherrySupplyService {

  constructor(private apiService: ApiService) { }

  saveDelivery(data: any): Observable<any> {
    return this.apiService.get('/cherrysupply/record_deliver/' + data);
  }
}
