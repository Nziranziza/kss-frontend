import {Injectable} from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot} from '@angular/router';
import {AuthorisationService} from '../authorisation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorisationGuardService implements CanActivate {

  constructor(protected router: Router,
              protected authorisationService: AuthorisationService) {
  }

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> | boolean {
    return this.hasRequiredPermission(route.data['permissions'.toString()]);
  }
  protected hasRequiredPermission(roles: any[]): Promise<boolean> | boolean {
    if (roles) {
      return this.authorisationService.hasRoles(roles);
    } else {
      return this.authorisationService.hasRoles(null);
    }
  }
}
