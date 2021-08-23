import {Injectable} from '@angular/core';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DryProcessingService {

  constructor(private apiService: ApiService) { }

  prepareGreenCoffee(body: any) {
    return this.apiService.post('/dmparchment/prepare/green_coffee', body);
  }

  saveGreenCoffee(body: any) {
    return this.apiService.post('/greencoffee/save', body);
  }

  updateGreenCoffee(body: any, id: string) {
    return this.apiService.post('/greencoffee/update/' + id, body);
  }

  getSupplyingOrg(orgId: string) {
    return this.apiService.get('/dmparchment/suppliers/' + orgId);
  }

  cancelGreenCoffee(id: string) {
    return this.apiService.delete('/greencoffee/delete/' + id);
  }

  cancelGreenCoffeeItem(id: string) {
    return this.apiService.delete('/greencoffee/delete/item/' + id);
  }

  getGreenCoffeeStockSummary(id: string) {
    return this.apiService.get('/' + id);
  }

  getGreenCoffee(id: string) {
    return this.apiService.get('/greencoffee/list/' + id);
  }

  getOneGreenCoffee(orgId: string, id: string) {
    return this.apiService.get('/greencoffee/find/' + orgId + '/' + id);
  }
}
