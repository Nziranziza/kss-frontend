import { Injectable } from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SiteService {

  constructor(
    private apiService: ApiService
  ) { }

  all(body: any): Observable<any> {
    return this.apiService.post('/site/list', body);
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

  update(id: string, site: any): Observable<any> {
    return this.apiService.put('/site/update_site/' + id, site);
  }

  getZone(body: any): Observable<any> {
    return this.apiService.post('/site/zone/list', body);
  }

}
