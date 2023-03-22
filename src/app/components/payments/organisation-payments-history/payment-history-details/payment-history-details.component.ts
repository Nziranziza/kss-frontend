import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CherrySupplyService, OrganisationService} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-payment-history-details',
  templateUrl: './payment-history-details.component.html',
  styleUrls: ['./payment-history-details.component.css']
})
export class PaymentHistoryDetailsComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() deliveries: any;
  @Input() regNumber: string;
  detailedDeliveries: any;
  // @ts-ignore

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private organisationService: OrganisationService,
    private cherrySupplyService: CherrySupplyService,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.cherrySupplyService.getDetailedDeliveries({deliveries: this.deliveries}).subscribe((data) => {
      this.detailedDeliveries = data.content;
    });
  }
}
