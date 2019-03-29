import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../core/services';

@Component({
  selector: 'app-topnavbar',
  templateUrl: './topnavbar.component.html',
  styleUrls: ['./topnavbar.component.css']
})
export class TopnavbarComponent implements OnInit {

  surname: string;
  regNumber: string;

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
   /* this.surname = this.authenticationService.getCurrentUser().info.surname;
    this.regNumber = this.authenticationService.getCurrentUser().info.regNumber;*/
  }
}
