import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  constructor(
    private apiService: ApiService
  ) {
  }

  allEntries(): Observable<any> {
    return this.apiService.get('/warehouse');
  }

  saveEntry(entry: any): Observable<any> {
    return this.apiService.post('/warehouse/record_warehouseentry', entry);
  }

  getEntries(type: string): Observable<any> {
    return this.apiService.get('/warehouse/byinputtype/' + type);
  }

  getDispatches() {
    return this.apiService.get('/inputdispatch');
  }

  filterDispatches(body: any) {
    return this.apiService.post('/inputdispatch', body);
  }

  printDeliveryNote(data: any): Observable<any> {
    return this.apiService.post('/inputdispatch/generate/delivery_note', data);
  }
  getPesticideList(): Observable<any> {
    return this.apiService.get('/season/pesticide/list');
  }
}
