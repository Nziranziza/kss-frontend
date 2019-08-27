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
    console.log(data);
    return this.apiService.put('/season/update_distribution', data);
  }
  updateParameter(data: any): Observable<any> {
    console.log(data);
    return this.apiService.put('/season/update_agroinput', data);
  }
  changeSeason(data: any): Observable<any> {
    return this.apiService.post('/season/set/cache', data);
  }

  addSeason(data: any): Observable<any> {
    return this.apiService.post('/season/settings', data);
  }

}
