import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {JwtService} from './jwt.service';
import {AuthUser} from '../models';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';


@Injectable()
export class AuthenticationService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService) {
  }

  setAuth(user: AuthUser) {
    this.jwtService.saveToken(user.token);
    window.localStorage.setItem('user', JSON.stringify(user));
  }

  purgeAuth() {
    this.jwtService.destroyToken();
  }

  attemptAuth(credentials): Observable<any> {
    return this.apiService.post('/users/sign.in', credentials)
      .pipe(map(
        data => {
          this.setAuth(data.content);
          return data;
        },
      ));
  }

  getCurrentUser(): AuthUser {
    return JSON.parse(window.localStorage.getItem('user'));
  }

  requestReset(email): Observable<any> {
    return this.apiService.post('/users/request/password-reset', email);
  }

  resetPassword(password, options?): Observable<any> {
    return this.http.post(`${environment.api_url}${'/users/password-reset'}`, password, options);
  }

  validateResetToken(token: string) {
    return this.apiService.get('/users/confirmation/' + token);
  }

  unlock(body, options?): Observable<any> {
    return this.http.post(`${environment.api_url}${'/api/users/account/unlock'}`, body, options);
  }
}
