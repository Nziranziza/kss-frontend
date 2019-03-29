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

  all(organisationId: string): Observable<any[]> {
    return this.apiService.get('/organisations/' + organisationId + '/users');
  }

  get(organisationId: string, id: string): Observable<any> {
    return this.apiService.get('/organisations/' + organisationId + '/users/' + id);
  }

  destroy(organisationId: string, id: string): Observable<any> {
    return this.apiService.delete('/organisations/' + organisationId + '/users/' + id);
  }

  save(user: User): Observable<any> {
    return this.apiService.post('/users/', user);
  }

  update(user: User, id: string): Observable<any> {
    return this.apiService.put('/users/' + id, user);
  }
  userTypes(): Observable<any> {
    return this.apiService.get('/users/user.types/list');
  }
}
