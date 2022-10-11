import {
  AfterViewInit,
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ConfirmDialogService,
  InputDistributionService,
  ExcelServicesService,
} from '../../../../core';
import { isPlatformBrowser } from '@angular/common';
import { BasicComponent } from '../../../../core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-view-application',
  templateUrl: './view-application.component.html',
  styleUrls: ['./view-application.component.css'],
})
export class ViewApplicationComponent
  extends BasicComponent
  implements OnInit, AfterViewInit {
  modal: NgbActiveModal;
  @Input() stockOut;
  recipients = [];
  objectKeys = Object.keys;
  printStockOuts = [];
  errors: string[];
  message: string;
  dtOptions: any = {};
  loading = false;
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector,
    private inputDistributionService: InputDistributionService,
    private excelService: ExcelServicesService,
    private datePipe: DatePipe,
    private confirmDialogService: ConfirmDialogService
  ) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
    };
    this.recipients = this.groupBy(this.stockOut.recipients, 'regNumber');
    if (this.objectKeys(this.recipients)[0] !== undefined) {
      this.createExcelData(this.stockOut.recipients);
    }
  }

  groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    });
  }

  onSubmit() {}

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  cancelDistribution(stockId: string, inputType: string, recipient: any) {
    this.confirmDialogService
      .openConfirmDialog(
        'Do you want to cancel the application. ' +
          'this action can not be undone.'
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (inputType === 'Fertilizer') {
            const body = {
              stockId,
              quantity: recipient.quantity,
              farmerRequestId: recipient.farmerRequestId,
            };
            this.inputDistributionService.cancelDistribution(body).subscribe(
              (data) => {
                this.setMessage('Successful cancelled!');
                this.stockOut.recipients = this.stockOut.recipients.filter(
                  (value) => {
                    return value.farmerRequestId !== recipient.farmerRequestId;
                  }
                );
                this.recipients = this.groupBy(
                  this.stockOut.recipients,
                  'regNumber'
                );
                this.createExcelData(this.stockOut.recipients);
              },
              (err) => {
                this.setError(err.errors);
              }
            );
          }
          if (inputType === 'Pesticide') {
            const body = {
              stockId,
              quantity: recipient.quantity,
              farmerRequestId: recipient.farmerRequestId,
            };
            this.inputDistributionService
              .cancelPesticideDistribution(body)
              .subscribe(
                (data) => {
                  this.setMessage('Successful cancelled!');
                  this.stockOut.recipients = this.stockOut.recipients.filter(
                    (value) => {
                      return (
                        value.farmerRequestId !== recipient.farmerRequestId
                      );
                    }
                  );
                  this.recipients = this.groupBy(
                    this.stockOut.recipients,
                    'regNumber'
                  );
                  this.createExcelData(this.stockOut.recipients);
                },
                (err) => {
                  this.setError(err.errors);
                }
              );
          }
        }
      });
  }

  createExcelData(stockouts) {
    stockouts.map((item) => {
      const temp = {
        REG_NUMBER: item.regNumber,
        FARMER_NAME: `${item.foreName ? item.foreName : ''} ${
          item.surname ? item.surname : ''
        }`,
        ALLOCATED_QTY: item.farmerAllocatedQty,
        RECEIVED_QTY: item.quantity,
        DATE: this.datePipe.transform(
          new Date(item.doneOn),
          'yyyy-MM-dd',
          'GMT+2'
        ),
        APPROVED_QTY: item.farmerApprovedQty,
      };
      this.printStockOuts.push(temp);
    });
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(
      this.printStockOuts,
      'stockout_recipients'
    );
  }
}
