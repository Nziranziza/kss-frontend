import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SiteService} from '../../../core/services';
import {Router} from '@angular/router';
import {InputDistributionService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {WarehouseService} from '../../../core/services';
import {Subject} from 'rxjs';
import {AuthenticationService} from '../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DeliveryDetailsComponent} from './delivery-details/delivery-details.component';

@Component({
  selector: 'app-warehouse-entries',
  templateUrl: './warehouse-entries.component.html',
  styleUrls: ['./warehouse-entries.component.css']
})
export class WarehouseEntriesComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService, private modal: NgbModal,
              private authenticationService: AuthenticationService,
              private router: Router, private inputDistributionService: InputDistributionService,
              private helper: HelperService, private warehouseService: WarehouseService) {
  }

  recordEntriesForm: FormGroup;
  filterEntriesForm: FormGroup;
  errors: any;
  message: any;
  types = [
    {
      name: 'fertilizer',
      value: 'Fertilizer'
    },
    {
      name: 'pesticide',
      value: 'Pesticide'
    }
  ];
  entries: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;

  ngOnInit() {
    this.recordEntriesForm = this.formBuilder.group({
      deliveryDetails: this.formBuilder.group({
        driver: [''],
        driverPhoneNumber: [''],
        vehiclePlate: [''],
        numberOfBags: [''],
        totalQty: [''],
        date: ['']
      }),
      supplierName: [''],
      supplierEmail: [''],
      org_id: [''],
      inputType: ['Fertilizer'],
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.filterEntriesForm = this.formBuilder.group({
      entriesFilter: ['all', Validators.required],
    });
    this.onChangeEntriesFilter();
    this.getEntries();
  }

  onChangeEntriesFilter() {
    this.filterEntriesForm.get('entriesFilter'.toString()).valueChanges.subscribe(
      (value) => {
        switch (value) {
          case 'Fertilizer': {
            this.warehouseService.getEntries(value)
              .subscribe((data) => {
                this.entries = data.content;
              });
            break;
          }
          case 'Pesticide': {
            this.warehouseService.getEntries(value)
              .subscribe((data) => {
                this.entries = data.content;
              });
            break;
          }
          default: {
            this.warehouseService.allEntries()
              .subscribe((data) => {
                this.entries = data.content;
              });
          }
        }
      }
    );
  }

  onSubmit() {
    if (this.recordEntriesForm.valid) {
      const entry = JSON.parse(JSON.stringify(this.recordEntriesForm.value));
      entry.org_id = this.authenticationService.getCurrentUser().info.org_id;
      entry.deliveryDetails.receivedBy = this.authenticationService.getCurrentUser().info._id;
      this.warehouseService.saveEntry(entry)
        .subscribe(() => {
            this.message = 'Entry successfully recorded!';
            this.errors = '';
            this.warehouseService.allEntries().subscribe((data) => {
              this.entries = data.content;
            });
          },
          (err) => {
            this.message = '';
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.recordEntriesForm);
    }
  }

  getEntries() {
    this.loading = true;
    this.warehouseService.allEntries().subscribe((data) => {
      this.loading = false;
      this.entries = data.content;
      this.dtTrigger.next();
    });
  }
  deliveryDetails(details) {
    const modalRef = this.modal.open(DeliveryDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.deliveries = details;
    modalRef.result.finally(() => {
    });
  }
}
