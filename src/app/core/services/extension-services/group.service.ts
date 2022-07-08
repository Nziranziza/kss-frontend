import {Injectable} from '@angular/core';
import {ApiService} from '../api.service';

@Injectable({
  providedIn: 'root'
})

export class GroupService {

  constructor(private apiService: ApiService) {
  }
  create(body: any) {
    return this.apiService.post('/v1.1/groups', body);
  }
  list(body: any) {
    return this.apiService.post('/v1.1/groups/reference', body);
  }
  post(body: any) {
    return this.apiService.put('/v1.1/groups', body);
  }
  get(id: string) {
    return this.apiService.get('/v1.1/groups/' + id );
  }
  delete(id: string) {
    return this.apiService.delete('/v1.1/groups/' + id );
  }
  update(id: string, body: any) {
    return this.apiService.put('/v1.1/groups/' + id,  body);
  }

  getByName(body: any) {
    return this.apiService.post('/v1.1/groups/search', body);
  }
}
