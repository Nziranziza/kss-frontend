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

  one(id: string): Observable<any> {
    return this.apiService.get('/coffeetype/' + id);
  }

  delete(id: string): Observable<any> {
    return this.apiService.delete('/coffeetype/' + id);
  }

  update(body: any): Observable<any> {
    return this.apiService.put('/coffeetype', body);
  }

  save(body: any) {
    return this.apiService.post('/coffeetype', body);
  }
}
