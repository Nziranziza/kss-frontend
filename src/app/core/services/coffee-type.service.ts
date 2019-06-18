import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CoffeeTypeService {

  constructor(private apiService: ApiService) {}

  all(): Observable<any> {
    return this.apiService.get('/coffeetype');
  }

  save(body: any) {
    return this.apiService.post('/coffeetype', body);
  }
}
