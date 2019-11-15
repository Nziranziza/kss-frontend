import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SiteService {

  constructor(
    private apiService: ApiService
  ) {
  }

  all(body: any): Observable<any> {
    return this.apiService.post('/site/list', body);
  }
  getAll(): Observable<any> {
    return this.apiService.get('/site');
  }

  get(id: string): Observable<any> {
    return this.apiService.get('/site/' + id);
  }

  destroy(id: string): Observable<any> {
    return this.apiService.delete('/site/' + id);
  }

  save(site: any): Observable<any> {
    return this.apiService.post('/site/create_site', site);
  }

  update(site: any): Observable<any> {
    return this.apiService.put('/site/update_site', site);
  }

  getZone(body: any): Observable<any> {
    return this.apiService.post('/site/zone/list', body);
  }

  getSite(body: any): Observable<any> {
    return this.apiService.post('/site/list', body);
  }

  getSectorAllocatedFertilizer(sectorId: string) {
    return this.apiService.get('/site/sector/allocated/' + sectorId);
  }

  getSiteFarmers(body: any): Observable<any> {
    return this.apiService.post('/coffeefarmers/farmer_by_site', body);
  }

  getSitePendingFarmers(body: any): Observable<any> {
    return this.apiService.post('/pendingfarmers/tempofarmer_by_site', body);
  }
}
