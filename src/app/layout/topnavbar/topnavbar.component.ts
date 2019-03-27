import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../core/services';
import {Router} from '@angular/router';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-topnavbar',
  templateUrl: './topnavbar.component.html',
  styleUrls: ['./topnavbar.component.css']
})
export class TopnavbarComponent implements OnInit {

  private surname: string;
  private regNumber: string;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) {

  }

  ngOnInit() {
    this.surname = this.authenticationService.getCurrentUser().surname;
    this.regNumber = this.authenticationService.getCurrentUser().regNumber;
  }

  logout() {
    this.authenticationService.purgeAuth();
    this.router.navigateByUrl('login');
  }
}
