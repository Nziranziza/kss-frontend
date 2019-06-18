import {Component, OnInit} from '@angular/core';
import {AuthorisationService} from '../../core/services/authorisation.service';
import {AuthenticationService} from '../../core/services';

declare var $;

@Component({
  selector: 'app-asidenavbar',
  templateUrl: './asidenavbar.component.html',
  styleUrls: ['./asidenavbar.component.css'],
  providers: [AuthorisationService]
})
export class AsidenavbarComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService) {
  }

  parameters: any;
  user: any;

  ngOnInit() {
    $(document).ready(() => {
      const trees: any = $('[data-widget="tree"]');
      trees.tree();
    });

    this.parameters = this.authenticationService.getCurrentUser().parameters;
    this.user = this.authenticationService.getCurrentUser().info;
  }
}
