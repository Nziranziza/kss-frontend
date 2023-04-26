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
  excess: boolean;
  recipients = [];
  objectKeys = Object.keys;
  totalReceived = 0;
  totalApproved = 0;
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
    const total = this.stockOut.recipients.reduce((accumulator, currentValue) => accumulator + Number(currentValue.quantity), 0);
    this.excess = total > this.stockOut.distributedQty || total > this.stockOut.totalQuantity;
  }

  groupBy = (items, key) => items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }),
    {},
  );

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  cancelDistribution(stockId: string, inputType: string, recipient: any, reason?: number) {
    const msg = reason === 0 ? 'reject': 'cancel';
    this.confirmDialogService
      .openConfirmDialog(
        `Do you want to ${msg} the application. ` +
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
              recipientId: recipient._id,
            };
            this.inputDistributionService.cancelDistribution(body, reason).subscribe(
              (data) => {
                this.setMessage('Successful ' + msg);
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
              recipientId: recipient._id
            };
            this.inputDistributionService
              .cancelPesticideDistribution(body)
              .subscribe(
                (data) => {
                  this.setMessage('Successful ' + msg);
                  this.stockOut.recipients = this.stockOut.recipients.filter(
                    (value) => {
                      return (
                        value._id !== recipient._id
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

  createExcelData(recipients) {
    this.totalReceived = 0;
    this.totalApproved = 0;
    recipients.map((item) => {
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
      this.totalReceived = this.totalReceived + Number(item.quantity);
      this.totalApproved = this.totalApproved + Number(item.farmerApprovedQty);
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
