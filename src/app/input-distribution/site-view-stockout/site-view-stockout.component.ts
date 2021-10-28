import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, InputDistributionService, MessageService} from '../../core/services';
import {Subject} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecordSiteStockReturnComponent} from './site-stock-return/record-site-stock-return.component';
import {constant} from '../../../environments/constant';
import {RecordSiteStockOutComponent} from './site-stock-out/record-site-stock-out.component';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';
import {ViewApplicationComponent} from './view-application/view-application.component';
import {BasicComponent} from '../../core/library';

@Component({
  selector: 'app-site-view-stockout',
  templateUrl: './site-view-stockout.component.html',
  styleUrls: ['./site-view-stockout.component.css']
})
export class SiteViewStockoutComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private inputDistributionService: InputDistributionService,
              private messageService: MessageService,
              private router: Router,
              private route: ActivatedRoute,
              private authenticationService: AuthenticationService, private modal: NgbModal) {
    super();
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
  siteId: string;

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.route.params.subscribe(params => {
      this.siteId = params['siteId'.toString()];
    });
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.getStocks();
  }

  getStocks() {
    this.inputDistributionService.getSiteStockOuts(this.siteId).subscribe((data) => {
      this.stockOuts = data.content;
      this.dtTrigger.next();
    });

    this.inputDistributionService.getStock(constant.stocks.SITE, this.siteId).subscribe((data) => {
      this.stocks = data.content;
    });
  }

  returnStockOut(stockOutId: string): void {
    const modalRef = this.modal.open(RecordSiteStockReturnComponent, {size: 'lg'});
    modalRef.componentInstance.stockOutId = stockOutId;
    modalRef.result.finally(() => {
      this.inputDistributionService.getStock(constant.stocks.SITE, this.siteId).subscribe((data) => {
        this.stocks = data.content;
      });
      this.inputDistributionService.getSiteStockOuts(this.siteId).subscribe((data) => {
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
    modalRef.componentInstance.siteId = this.siteId;
    modalRef.result.finally(() => {
      this.inputDistributionService.getStock(constant.stocks.SITE, this.siteId).subscribe((data) => {
        this.stocks = data.content;
      });
      this.inputDistributionService.getSiteStockOuts(this.siteId).subscribe((data) => {
        this.stockOuts = data.content;
        this.rerender();
      });
      this.message = this.messageService.getMessage();
      this.messageService.clearMessage();
    });
  }

  viewApplication(stockId: string) {
    const modalRef = this.modal.open(ViewApplicationComponent, {size: 'lg'});
    modalRef.componentInstance.stockOut = this.stockOuts.find(stock => stock._id === stockId);
    modalRef.result.finally(() => {
      this.inputDistributionService.getSiteStockOuts(this.siteId).subscribe((data) => {
        this.stockOuts = data.content;
        this.rerender();
      });
      this.inputDistributionService.getStock(constant.stocks.SITE, this.siteId).subscribe((data) => {
        this.stocks = data.content;
      });
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
