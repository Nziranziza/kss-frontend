import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivateChild {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    console.log(this.authenticationService.isLoggedIn());
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log(this.authenticationService.isLoggedIn());
    if (!this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return false;
    } else {
      return true;
    }

  }
}
