import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {AuthenticationService} from '../../../../core/services';

@Component({
  selector: "app-select-deliveries",
  templateUrl: "./pay-farmers.component.html",
  styleUrls: ["./pay-farmers.component.css"],
})
export class PayFarmersComponent implements OnInit {
  orgId: string;
  currentURL = "";
  constructor(
    private authenticationService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private route: Router
  ) {}

  ngOnInit() {
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
    this.activatedRoute.url.subscribe(() => {
      this.currentURL = this.route.url;
    });
  }
}
