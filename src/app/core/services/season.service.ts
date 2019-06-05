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
    return this.apiService.get('/');
  }

  updateSeason(data: any): Observable<any> {
    return this.apiService.put('/', data);
  }

  addSeason(data: any): Observable<any> {
    return this.apiService.post('/', data);
  }

}
