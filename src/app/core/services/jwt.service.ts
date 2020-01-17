import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';

@Injectable()
export class JwtService {

  constructor(private cookieService: CookieService) {
  }

  getToken(): string {
    return this.cookieService.get('token');
  }

  saveToken(token: string) {
    return this.cookieService.set('token', token);
  }
  destroyToken() {
    return this.cookieService.delete('token');
  }

}
