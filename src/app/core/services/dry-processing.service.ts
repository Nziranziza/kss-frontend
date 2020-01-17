import {Injectable} from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DryProcessingService {

  constructor(private apiService: ApiService) { }

  createBatch(body: any) {
    return this.apiService.post('/batch', body);
  }

  getParchments(orgId: string, type: string) {
    return this.apiService.get('/dm_deliveries/pertype/list/' + type + '/' + orgId);
  }
}
