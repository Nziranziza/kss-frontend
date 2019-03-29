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

  all(organisationId: number): Observable<any[]> {
    return this.apiService.get('organisations/' + organisationId + '/users');
  }

  get(organisationId: number, id: number): Observable<any> {
    return this.apiService.get('organisations/' + organisationId + '/users/' + id);
  }

  destroy(organisationId: number, id: number): Observable<any> {
    return this.apiService.delete('organisations/' + organisationId + '/users/' + id);
  }

  save(organisationId: number, user: User): Observable<any> {
    if (user.id) {
      return this.apiService.put('organisations/' + organisationId + '/users/' + user.id, user);
    } else {
      return this.apiService.post('organisations/' + organisationId + '/users/', user);
    }
  }
}
