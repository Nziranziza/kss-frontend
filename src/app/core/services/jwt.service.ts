import { Injectable } from '@angular/core';


@Injectable()
export class JwtService {

  getToken(): string {
    return window.localStorage['jwtToken'.toString()];
  }

  saveToken(token: string) {
    window.localStorage['jwtToken'.toString()] = token;
  }

  destroyToken() {
    window.localStorage.removeItem('jwtToken');
  }

}
