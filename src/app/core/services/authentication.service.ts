import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {JwtService} from './jwt.service';
import {AuthUser} from '../models';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';

@Injectable()
export class AuthenticationService {
  constructor(
    private apiService: ApiService, private router: Router,
    private http: HttpClient,
    private cookieService: CookieService,
    private jwtService: JwtService) {
  }

  setAuth(user: AuthUser) {
    localStorage.clear();
    this.jwtService.saveToken(user.token);
    delete user.orgInfo.coveredSectors;
    this.setCurrentUser(user);
    this.setIsLoggedIn(true);
  }

  purgeAuth() {
    this.jwtService.destroyToken();
    this.setIsLoggedIn(false);
    this.cookieService.delete('user');
    localStorage.clear();
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

  setCurrentSeason(season: any) {
    this.cookieService.set('current-season', JSON.stringify(season));
  }

  getCurrentSeason() {
    return JSON.parse(this.cookieService.get('current-season'));
  }

  isLoggedIn() {
    return this.cookieService.get('loggedIn') === 'true';
  }

  setIsLoggedIn(value: boolean) {
    if (value) {
      this.cookieService.set('loggedIn', 'true');
    } else {
      this.cookieService.set('loggedIn', 'false');
    }
  }

  getCurrentUser(): AuthUser {
    if (!this.isLoggedIn()) {
      this.router.navigateByUrl('login');
    }
    return JSON.parse(this.cookieService.get('user'));
  }

  setCurrentUser(user: AuthUser) {
    this.cookieService.set('user', JSON.stringify(user));
  }

  setServices(services: any) {

    this.cookieService.set('services', JSON.stringify(services));
  }
  getServices() {
    return JSON.parse(this.cookieService.get('services'));
  }

  isSeasonSet() {
    return this.cookieService.check('current-season');
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
    return this.http.post(`${environment.api_url}${'/users/account/unlock'}`, body, options);
  }

  clearLocalStorage() {
    localStorage.clear();
  }

}
