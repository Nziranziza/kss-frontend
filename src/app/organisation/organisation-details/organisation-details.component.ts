import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-organisation-details',
  templateUrl: './organisation-details.component.html',
  styleUrls: ['./organisation-details.component.css']
})
export class OrganisationDetailsComponent implements OnInit {

  org: any;
  orgCoveredArea = [];

  modal: NgbActiveModal;
  @Input() organisation;
  requests: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
  }

}
