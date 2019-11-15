import {AfterViewInit, Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {Subject} from 'rxjs';
import {DatePipe} from '@angular/common';
import {AuthenticationService, ConfirmDialogService, ExcelServicesService, WarehouseService} from '../../../../core/services';
import {BasicComponent} from '../../../../core/library';

@Component({
  selector: 'app-delivery-details',
  templateUrl: './delivery-details.component.html',
  styleUrls: ['./delivery-details.component.css']
})
export class DeliveryDetailsComponent extends BasicComponent implements OnInit, AfterViewInit {

  modal: NgbActiveModal;
  @Input() deliveries;
  @Input() inputType;
  @Input() wareHouseId;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  printable = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private confirmDialogService: ConfirmDialogService,
    private wareHouseService: WarehouseService,
    private datePipe: DatePipe,
    private authenticationService: AuthenticationService, private excelService: ExcelServicesService,
    private injector: Injector) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    if (this.inputType === 'Fertilizer') {
      this.deliveries.map((entry) => {
        this.printable.push({
          Input: entry.inputId.inputName,
          Quantity: entry.items,
          QtyPerItem: entry.quantityPerItem,
          TotalQuantity: (entry.items * entry.quantityPerItem) + ' kg',
          Driver: entry.driver,
          Supplier: entry.supplier ? entry.supplier.name : '',
          Vehicle: entry.vehiclePlate,
          Date: this.datePipe.transform(entry.warehouseEntryDate, 'dd-MM-yyyy', 'GMT+0')
        });
      });
    } else {
      this.deliveries.map((entry) => {
        this.printable.push({
          Input: entry.inputId.inputName,
          TotalQuantity: (entry.items * entry.quantityPerItem) + ' l',
          Driver: entry.driver,
          Supplier: entry.supplier ? entry.supplier.name : '',
          Vehicle: entry.vehiclePlate,
          Date: this.datePipe.transform(entry.warehouseEntryDate, 'dd-MM-yyyy', 'GMT+0')
        });
      });
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  cancelEntry(id: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel entry? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            warehouseId: this.wareHouseId,
            subDocumentId: id,
            userId: this.authenticationService.getCurrentUser().info._id
          };
          this.wareHouseService.removeEntry(body).subscribe(() => {
            this.setMessage('Entry successfully cancelled!');
            this.deliveries = this.deliveries.filter((value) => {
              return value._id !== id;
            });
          }, (err) => {
            this.setError(this.errors = err.errors);
          });
        }
      });
  }
  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.printable, 'entries');
  }
}
