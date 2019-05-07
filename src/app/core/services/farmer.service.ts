import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {Farmer} from '../models';


@Injectable()
export class FarmerService {
  constructor(
    private apiService: ApiService
  ) {
  }

  all(): Observable<any> {
    return this.apiService.get('/coffeefarmers');
  }

  getFarmers(parameters: any): Observable<any> {
    return this.apiService.post('/coffeefarmers/getfarmers/', parameters);
  }

  get(id: string): Observable<any> {
    return this.apiService.get('/farmers/' + id);
  }

  destroy(id: string): Observable<any> {
    return this.apiService.delete('/farmers/' + id);
  }

  save(farmer: Farmer): Observable<any> {
    return this.apiService.post('/farmers/', farmer);
  }

  update(farmer: Farmer, id: string): Observable<any> {
    return this.apiService.put('/farmers/' + id, farmer);
  }

  listPending(): Observable<any> {
    return this.apiService.get('/pendingfarmers');
  }

  getPendingFarmers(parameters: any): Observable<any> {
    return this.apiService.post('/pendingfarmers/gettempofarmers/', parameters);
  }

  report(data: any): Observable<any> {
    return this.apiService.post('/stats/farmer.data?subRegions=true', data);
  }

  updateFarmerRequest(data: any): Observable<any> {
    return this.apiService.post('/stats/farmer.data?subRegions=true', data);
  }
}
