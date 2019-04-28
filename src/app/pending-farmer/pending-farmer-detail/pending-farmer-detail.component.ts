import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-pending-farmer-detail',
  templateUrl: './pending-farmer-detail.component.html',
  styleUrls: ['./pending-farmer-detail.component.css']
})
export class PendingFarmerDetailComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() farmer;
  requests: any;
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.requests = this.farmer.request.requestInfo;
    console.log(this.requests);
  }

}
