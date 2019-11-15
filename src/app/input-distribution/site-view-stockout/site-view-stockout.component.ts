import {Component, OnInit} from '@angular/core';
import {AuthenticationService, InputDistributionService} from '../../core/services';
import {Subject} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecordSiteStockReturnComponent} from './site-stock-return/record-site-stock-return.component';
import {constant} from '../../../environments/constant';
import {RecordSiteStockOutComponent} from './site-stock-out/record-site-stock-out.component';

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
  stocks: any;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.getStocks();
  }

  getStocks() {
    const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
    this.inputDistributionService.getSiteStockOuts(id).subscribe((data) => {
      this.stockOuts = data.content;
      this.dtTrigger.next();
    });

    this.inputDistributionService.getStock(constant.stocks.SITE, id).subscribe((data) => {
      this.stocks = data.content;
    });
  }

  returnStockOut(stockOutId: string): void {
    const modalRef = this.modal.open(RecordSiteStockReturnComponent, {size: 'lg'});
    modalRef.componentInstance.stockOutId = stockOutId;
    modalRef.result.finally(() => {
      const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
      this.inputDistributionService.getStock(constant.stocks.SITE, id).subscribe((data) => {
        this.stocks = data.content;
      });
      this.inputDistributionService.getSiteStockOuts(id).subscribe((data) => {
        this.stockOuts = data.content;
      });
    });
  }

  stockOut(stock: any) {
    const modalRef = this.modal.open(RecordSiteStockOutComponent, {size: 'lg'});
    modalRef.componentInstance.stock = stock;
    modalRef.result.finally(() => {
      const id = this.authenticationService.getCurrentUser().orgInfo.distributionSite;
      this.inputDistributionService.getStock(constant.stocks.SITE, id).subscribe((data) => {
        this.stocks = data.content;
      });
      this.inputDistributionService.getSiteStockOuts(id).subscribe((data) => {
        this.stockOuts = data.content;
      });
    });
  }
}
