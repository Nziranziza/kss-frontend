import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../core/services';

@Component({
  selector: 'app-select-deliveries',
  templateUrl: './pay-farmers.component.html',
  styleUrls: ['./pay-farmers.component.css']
})

export class PayFarmersComponent implements OnInit {

  orgId: string;
  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
  }
}
