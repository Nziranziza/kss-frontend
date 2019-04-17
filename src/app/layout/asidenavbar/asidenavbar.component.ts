import {Component, OnInit} from '@angular/core';
import {AuthorisationService} from '../../core/services/authorisation.service';

declare var $;

@Component({
  selector: 'app-asidenavbar',
  templateUrl: './asidenavbar.component.html',
  styleUrls: ['./asidenavbar.component.css'],
  providers: [AuthorisationService]
})
export class AsidenavbarComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    $(document).ready(() => {
      const trees: any = $('[data-widget="tree"]');
      trees.tree();
    });
  }
}
