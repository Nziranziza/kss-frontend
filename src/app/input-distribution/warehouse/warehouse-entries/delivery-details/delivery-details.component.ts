import {AfterViewInit, Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {Subject} from 'rxjs';
import {AuthenticationService, ConfirmDialogService, WarehouseService} from '../../../../core/services';

@Component({
  selector: 'app-delivery-details',
  templateUrl: './delivery-details.component.html',
  styleUrls: ['./delivery-details.component.css']
})
export class DeliveryDetailsComponent implements OnInit, AfterViewInit {

  modal: NgbActiveModal;
  @Input() deliveries;
  @Input() inputType;
  @Input() wareHouseId;
  errors: string [];
  message: string;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private confirmDialogService: ConfirmDialogService,
    private wareHouseService: WarehouseService,
    private authenticationService: AuthenticationService,
    private injector: Injector) {
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  cancelEntry(id: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel dispatch? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            warehouseId: this.wareHouseId,
            subDocumentId: id,
            userId: this.authenticationService.getCurrentUser().info._id
          };
          this.wareHouseService.removeEntry(body).subscribe(() => {
            this.message = 'Entry successfully cancelled!';
            this.deliveries = this.deliveries.filter((value) => {
              return value._id !== id;
            });
          }, (err) => {
            this.message = '';
            this.errors = err.errors;
          });
        }
      });
  }
}
