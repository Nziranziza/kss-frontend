import {Component, OnInit} from '@angular/core';
import {AuthenticationService, InputDistributionService} from '../../core/services';
import {Subject} from 'rxjs';
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
    const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
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
