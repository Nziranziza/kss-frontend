import {Component, OnInit} from '@angular/core';
import {AuthenticationService, InputDistributionService} from '../../core/services';
import {Subject} from 'rxjs';
import {ConfirmDispatchComponent} from '../site-view-dispatch/confirm-dispatch/confirm-dispatch.component';
import {RecordSiteStockOutComponent} from '../site-view-dispatch/site-stock-out/record-site-stock-out.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecordSiteStockReturnComponent} from './site-stock-return/record-site-stock-return.component';

@Component({
  selector: 'app-site-view-stockout',
  templateUrl: './site-view-stockout.component.html',
  styleUrls: ['./site-view-stockout.component.css']
})
export class SiteViewStockoutComponent implements OnInit {

  constructor(private inputDistributionService: InputDistributionService,
              private authenticationService: AuthenticationService, private modal: NgbModal) {
  }

  stockOuts: any;
  dtOptions: any = {};
  errors: string[];
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.getSiteStockOuts();
  }

  getSiteStockOuts() {
    this.loading = true;
    /* const id = this.authenticationService.getCurrentUser().info.distributionSite; */
    const id = '5d414020075a5550b7de08bb';
    this.inputDistributionService.getSiteStockOuts(id).subscribe((data) => {
      this.loading = false;
      this.stockOuts = data.content;
      this.dtTrigger.next();
    });
  }

  returnStockOut(stockOutId: string): void {
    const modalRef = this.modal.open(RecordSiteStockReturnComponent, {size: 'lg'});
    modalRef.componentInstance.stockOutId = stockOutId;
    modalRef.result.finally(() => {
    });
  }
}
