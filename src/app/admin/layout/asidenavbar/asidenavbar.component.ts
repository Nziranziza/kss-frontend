import {Component, OnInit} from '@angular/core';
import {AuthorisationService, DryProcessingService} from '../../../core';
import {AuthenticationService} from '../../../core';
import {Router} from '@angular/router';
import {constant} from '../../../../environments/constant';

declare var $;

@Component({
  selector: 'app-asidenavbar',
  templateUrl: './asidenavbar.component.html',
  styleUrls: ['./asidenavbar.component.css'],
  providers: [AuthorisationService]
})
export class AsidenavbarComponent implements OnInit {
  parameters: any;
  user: any;
  org: any;
  roles: any;
  hasGreenCoffee: false;

  constructor(private router: Router,
              private authorisationService: AuthorisationService,
              private dryProcessingService: DryProcessingService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    $(document).ready(() => {
      const trees: any = $('[data-widget="tree"]');
      trees.tree();
    });
    this.parameters = this.authenticationService.getCurrentUser().parameters;
    this.user = this.authenticationService.getCurrentUser().info;
    this.org = this.authenticationService.getCurrentUser().orgInfo;
    this.roles = constant.roles;
    if (this.authorisationService.isCWSAdmin()) {
      this.dryProcessingService.cwsHasGreenCoffee(this.user.org_id).subscribe((data) => {
        this.hasGreenCoffee = data.content.hasGreenCoffee;
      });
    }
  }

  onLogOut() {
    this.authenticationService.purgeAuth();
    this.router.navigateByUrl('login');
  }
}
