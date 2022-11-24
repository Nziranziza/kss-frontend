import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, InputDistributionService, MessageService, Organisation, OrganisationService, SiteService} from '../../../core';
import {Subject} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {RecordSiteStockReturnComponent} from './site-stock-return/record-site-stock-return.component';
import {constant} from '../../../../environments/constant';
import {RecordSiteStockOutComponent} from './site-stock-out/record-site-stock-out.component';
import {DataTableDirective} from 'angular-datatables';
import {ActivatedRoute, Router} from '@angular/router';
import {ViewApplicationComponent} from './view-application/view-application.component';
import {BasicComponent} from '../../../core';
import {StockOut} from '../../../core/models/stockout.model';
import {DispatchPlan} from '../../../core/models/dispatchPlan.model';

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
              private authenticationService: AuthenticationService, private modal: NgbModal,
              private organisationService: OrganisationService,
              private siteService: SiteService) {
    super();
  }

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;
  stockOuts: StockOut[];
  dtOptions: DataTables.Settings = {};
  errors: string[];
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  stocks: any;
  message: string;
  siteId: string;
  org: Organisation;
  fertilizerPlan: DispatchPlan;
  pesticidePlan: DispatchPlan[];
  cwsAllocatedFertilizer = 0;
  cwsRemainingQty = 0;
  cwsAllocatedPesticide = 0;
  cwsRemainingPesticide = 0;

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
    // Get Organisation information for the logged-in user, so we can get stock outs for cws
    this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
      this.org = data.content;
      this.getStocks();
      this.getOrgDispatchPlan();
    });
  }

  getOrgDispatchPlan(){
    this.cwsAllocatedFertilizer = 0;
    this.cwsAllocatedPesticide = 0;
    this.siteService.getCWSDispatchPlan(this.siteId).subscribe(data => {
      this.fertilizerPlan = data.data.fertilizers;
      this.pesticidePlan = data.data.pesticides;

      // Get plan for logged in CWS
      this.fertilizerPlan.cws.forEach(cws => {
        if(cws.org_id === this.org._id){
          this.cwsAllocatedFertilizer = cws.qty;
        }
      });

      this.pesticidePlan.forEach(plan => {
        plan.cws.forEach(cws => {
          if(cws.org_id === this.org._id){
            this.cwsAllocatedPesticide = this.cwsAllocatedPesticide + cws.qty;
          }
        })
      });
    });
  }

  getStocks() {
    this.inputDistributionService.getCwsStockOuts(this.org._id, this.siteId).subscribe((data) => {
      this.stockOuts = data.data;

      // Calculate Total Stocked out
      this.calculateStatistics();

      this.dtTrigger.next();
    });

    this.inputDistributionService.getStock(constant.stocks.SITE, this.siteId).subscribe((data) => {
      this.stocks = data.content;
    });
  }

  calculateStatistics(){
    this.cwsRemainingQty = 0;
    this.cwsRemainingPesticide = 0;
    this.stockOuts.forEach(stockOut => {
      if(stockOut.inputId.inputType === 'Fertilizer'){
        this.cwsRemainingQty = this.cwsRemainingQty + stockOut.totalQuantity;
      }
      else{
        this.cwsRemainingPesticide = this.cwsRemainingPesticide + stockOut.totalQuantity;
      }
    });
  }

  returnStockOut(stockOutId: string): void {
    const modalRef = this.modal.open(RecordSiteStockReturnComponent, {size: 'lg'});
    modalRef.componentInstance.stockOutId = stockOutId;
    modalRef.result.finally(() => {
      this.inputDistributionService.getStock(constant.stocks.SITE, this.siteId).subscribe((data) => {
        this.stocks = data.content;
      });
      this.inputDistributionService.getCwsStockOuts(this.org._id, this.siteId).subscribe((data) => {
        this.stockOuts = data.data;
        this.calculateStatistics();
        this.rerender();
      });
      this.getOrgDispatchPlan();
      this.message = this.messageService.getMessage();
      this.messageService.clearMessage();
    });
  }

  getTotalStockedOut(stock: any){
    let totalStockOut = 0;
    if(stock.inputId.inputType === 'Fertilizer'){
      const fertilizer = this.fertilizerPlan.cws.find(cws => cws.org_id === this.org._id);
      // Calculate so far how much input has been stocked out.
      this.stockOuts.forEach((data) =>  {
        if(data.inputId.inputType === 'Fertilizer'){
          totalStockOut = totalStockOut + data.totalQuantity
        }
      });
    }else{
      const pesticide = this.pesticidePlan.find(plan => {
        if(plan.inputId === stock.inputId._id){
          // Calculate so far how much input has been stocked out.
          this.stockOuts.forEach((data) =>  {
            if(data.inputId._id === stock.inputId._id){
              totalStockOut = totalStockOut + data.totalQuantity
            }
          });
          return plan.cws.find(cws => cws.org_id === this.org._id);
        }
      });
    }
    return totalStockOut;
  }

  stockOut(stock: any) {
    const modalRef = this.modal.open(RecordSiteStockOutComponent, {size: 'lg'});
    modalRef.componentInstance.stock = stock;
    modalRef.componentInstance.siteId = this.siteId;

    if(stock.inputId.inputType === 'Fertilizer'){
      const fertilizer = this.fertilizerPlan.cws.find(cws => cws.org_id === this.org._id);
      modalRef.componentInstance.totalqty = fertilizer.qty;
    }else{
      const pesticide = this.pesticidePlan.find(plan => {
        if(plan.inputId === stock.inputId._id)
          return plan.cws.find(cws => cws.org_id === this.org._id);
      });
      modalRef.componentInstance.totalqty = pesticide.qty;
    }

    modalRef.componentInstance.totalStockOutFertilizer = this.getTotalStockedOut(stock);
    modalRef.result.finally(() => {
      this.inputDistributionService.getStock(constant.stocks.SITE, this.siteId).subscribe((data) => {
        this.stocks = data.content;
      });
      this.inputDistributionService.getCwsStockOuts(this.org._id, this.siteId).subscribe((data) => {
        this.stockOuts = data.data;
        this.rerender();
        // Calculate Total Stocked out
        this.calculateStatistics();
      });
      this.message = this.messageService.getMessage();
      this.messageService.clearMessage();
    });
  }

  viewApplication(stockId: string) {
    const modalRef = this.modal.open(ViewApplicationComponent, {size: 'lg'});
    modalRef.componentInstance.stockOut = this.stockOuts.find(stock => stock._id === stockId);
    modalRef.result.finally(() => {
      this.inputDistributionService.getCwsStockOuts(this.org._id, this.siteId).subscribe((data) => {
        this.stockOuts = data.data;
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

  getDestination(destinations) {
    let str = '';
    destinations.map((dest) => {
      str = str + ' - ' + dest.cell_id.name;
    });
    return str;
  }

  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
