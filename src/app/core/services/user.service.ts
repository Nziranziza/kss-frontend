import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Observable} from 'rxjs';
import {User} from '../models';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  constructor(
    private apiService: ApiService
  ) {
  }

  all(organisationId: string): Observable<any> {
    return this.apiService.get('/users/organization/' + organisationId);
  }

  get(id: string): Observable<any> {
    return this.apiService.get('/users/id/' + id);
  }

  destroy(id: string): Observable<any> {
    return this.apiService.delete('/users/' + id);
  }

  save(user: User): Observable<any> {
    return this.apiService.post('/users', user);
  }

  update(user: User): Observable<any> {
    return this.apiService.put('/users/full', user);
  }
  userTypes(): Observable<any> {
    return this.apiService.get('/users/user.types/list');
  }

  checkEmail(body: any): Observable<any> {
    return this.apiService.post('/users/email', body);
  }

  checkNID(body: any): Observable<any> {
    return this.apiService.post('/users/nid', body);
  }

  verifyNID(nid: string): Observable<any> {
    return this.apiService.get('/users/verifyNID/' + nid);
  }


}
