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

  getDispatches() {
    return this.apiService.get('/inputdispatch');
  }

  filterDispatches(body: any) {
    return this.apiService.post('/inputdispatch', body);
  }

  removeEntry(body: any) {
    return this.apiService.put('/warehouse/remove/entry', body);
  }

  printDeliveryNote(id: string): Observable<any> {
    return this.apiService.get('/inputdispatch/generate/delivery_note/' + id);
  }
}
