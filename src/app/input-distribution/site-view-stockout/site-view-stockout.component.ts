import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, InputDistributionService, MessageService} from '../../core/services';
import {Subject} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecordSiteStockReturnComponent} from './site-stock-return/record-site-stock-return.component';
import {constant} from '../../../environments/constant';
import {RecordSiteStockOutComponent} from './site-stock-out/record-site-stock-out.component';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-site-view-stockout',
  templateUrl: './site-view-stockout.component.html',
  styleUrls: ['./site-view-stockout.component.css']
})
export class SiteViewStockoutComponent implements OnInit, OnDestroy {

  constructor(private inputDistributionService: InputDistributionService,
              private messageService: MessageService,
              private authenticationService: AuthenticationService, private modal: NgbModal) {
  }

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  stockOuts: any;
  dtOptions: DataTables.Settings = {};
  errors: string[];
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  stocks: any;
  message: string;

  ngOnInit() {
    this.getStocks();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
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
        this.rerender();
      });
      this.message = this.messageService.getMessage();
      this.messageService.clearMessage();
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
        this.rerender();
      });
      this.message = this.messageService.getMessage();
      this.messageService.clearMessage();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
