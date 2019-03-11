import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../core/services';
import {Router} from '@angular/router';

@Component({
  selector: 'app-topnavbar',
  templateUrl: './topnavbar.component.html',
  styleUrls: ['./topnavbar.component.css']
})
export class TopnavbarComponent implements OnInit {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router) {

  }

  ngOnInit() {

  }

  logout() {
    this.authenticationService.purgeAuth();
    this.router.navigateByUrl('login');
  }
}
