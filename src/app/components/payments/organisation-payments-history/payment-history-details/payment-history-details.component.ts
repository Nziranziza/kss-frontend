import {Component, Inject, Injector, Input, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Subject} from 'rxjs';
import {CherrySupplyService, OrganisationService} from '../../../../core';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-payment-history-details',
  templateUrl: './payment-history-details.component.html',
  styleUrls: ['./payment-history-details.component.css']
})
export class PaymentHistoryDetailsComponent implements OnInit, OnDestroy {

  modal: NgbActiveModal;
  @Input() deliveries: any;
  @Input() regNumber: string;
  detailedDeliveries: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

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
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {}, {}, {}, {
        class: 'none'
      }, {}, {}],
      responsive: true
    };
    this.cherrySupplyService.getDetailedDeliveries({deliveries: this.deliveries}).subscribe((data) => {
      this.detailedDeliveries = data.content;
      this.dtTrigger.next();
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}
