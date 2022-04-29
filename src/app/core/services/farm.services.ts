import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})

export class FarmService {

  constructor(private apiService: ApiService) {
  }

  createTreeVariety(body: any): Observable<any> {
    return this.apiService.post('/v1.1/farm/tree-varieties/create', body);
  }

  listTreeVarieties(): Observable<any> {
    return this.apiService.get('/v1.1/farm/tree-varieties/list');
  }

  getTreeVariety(id: string): Observable<any> {
    return this.apiService.get('/v1.1/farm/tree-varieties' + id);
  }

  updateTreeVariety(id: string, body: any): Observable<any> {
    return this.apiService.put('/v1.1/farm/tree-varieties/update' + id, body);
  }

}
