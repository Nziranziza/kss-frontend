import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Gap } from '../../models';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class GapService {
  constructor(private apiService: ApiService) {}

  all(): Observable<any> {
    return this.apiService.get('/v1.1/gaps');
  }

  one(id: string): Observable<any> {
    return this.apiService.get('/v1.1/gaps/' + id);
  }

  delete(id: string): Observable<any> {
    return this.apiService.delete('/v1.1/gaps/' + id);
  }

  update(body: Gap, id: string): Observable<any> {
    return this.apiService.put('/v1.1/gaps/' + id, body);
  }

  save(body: any) {
    return this.apiService.post('/v1.1/gaps', body);
  }
}
