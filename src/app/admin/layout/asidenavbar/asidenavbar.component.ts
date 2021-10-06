import {Component, OnInit} from '@angular/core';
import {AuthorisationService} from '../../../core/services';
import {AuthenticationService} from '../../../core/services';
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
  private siteId: string;
  parameters: any;
  user: any;
  roles: any;
  constructor(private router: Router, private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    $(document).ready(() => {
      const trees: any = $('[data-widget="tree"]');
      trees.tree();
    });
    this.parameters = this.authenticationService.getCurrentUser().parameters;
    this.user = this.authenticationService.getCurrentUser().info;
    this.siteId = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
    this.roles = constant.roles;
  }

  onLogOut() {
    this.authenticationService.purgeAuth();
    this.router.navigateByUrl('login');
  }
}
