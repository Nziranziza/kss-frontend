import {Injectable} from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot} from '@angular/router';
import {AuthorisationService} from '../authorisation.service';
import {AuthenticationService} from '../authentication.service';

@Injectable({
  providedIn: 'root'
})

export class AuthorisationGuardService implements CanActivate {
  currentUser: any;

  constructor(protected router: Router,
              protected authorisationService: AuthorisationService,
              protected authenticationService: AuthenticationService) {
    this.currentUser = this.authenticationService.getCurrentUser();
  }

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> | boolean {
    return this.hasRequiredPermission(route.data['permissions'.toString()]);
  }

  protected hasRequiredPermission(permissions: any[]): Promise<boolean> | boolean {
    let isType = false;
    let hasRole = false;
    let hasPermission = false;
    if (this.currentUser && this.currentUser.parameters.role) {
      permissions.forEach((permission) => {
        if (!Array.isArray(permission)) {
          if (this.currentUser.parameters.role.includes(permission)) {
            hasPermission = true;
          }
        } else {
          hasRole = this.currentUser.parameters.role.includes(permission[0]);
          isType = + this.currentUser.parameters.type === permission[1];
          if (hasRole && isType) {
            hasPermission = true;
          }
        }
      });
      if (!hasPermission) {
        this.router.navigateByUrl('/login');
        return false;
      } else {
        return true;
      }
    }
  }
}

