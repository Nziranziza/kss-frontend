import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {

  constructor(private apiService: ApiService) {
  }

  all(): Observable<any> {
    return this.apiService.get('/season/settings');
  }
  updateDistribution(data: any): Observable<any> {
    return this.apiService.post('/season/update_distribution', data);
  }
  updateFertilizer(data: any): Observable<any> {
    return this.apiService.put('/season/update_fertilizer', data);
  }
  updatePesticide(data: any): Observable<any> {
    return this.apiService.put('/season/update_pesticide', data);
  }
  updatePrice(data: any): Observable<any> {
    return this.apiService.put('/season/update_price', data);
  }
  changeSeason(data: any): Observable<any> {
    return this.apiService.post('/season/set/cache', data);
  }
  addSeason(data: any): Observable<any> {
    return this.apiService.post('/season/settings', data);
  }
}
