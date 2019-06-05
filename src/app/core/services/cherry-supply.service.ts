import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CherryDeliveryService {

  constructor(
    private apiService: ApiService
  ) { }

  saveDelivery(id: string): Observable<any> {
    return this.apiService.get('/users/id/' + id);
  }

}
