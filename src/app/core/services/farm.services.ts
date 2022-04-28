import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})

export class FarmService {

  constructor(private apiService: ApiService) {
  }

  createTreesVariety(body: any): Observable<any> {
    return this.apiService.post('/v1.1/farm/trees-variety', body);
  }

  listTreesVarieties(): Observable<any> {
    return this.apiService.get('/v1.1/farm/trees-variety');
  }

  getTreesVariety(id: string): Observable<any> {
    return this.apiService.get('/v1.1/farm/trees-variety/' + id);
  }

  updateTreesVariety(id: string, body: any): Observable<any> {
    return this.apiService.post('/v1.1/farm/trees-variety' + id, body);
  }

}
