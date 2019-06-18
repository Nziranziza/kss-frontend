import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorisationService {

  userRoles: any;
  hasAccess: boolean;

  constructor(private authenticationService: AuthenticationService) {
    this.hasAccess = false;
  }

  hasRoles(roles: string[]): boolean {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    roles.forEach((role) => {
      if (this.userRoles.includes(role)) {
        this.hasAccess = true;
      }
    });
    return this.hasAccess;
  }

  clear() {
    this.hasAccess = false;
  }

  isCWSUser() {
    this.userRoles = this.authenticationService.getCurrentUser().parameters.role;
    return !!this.userRoles.includes(1);
  }
}
