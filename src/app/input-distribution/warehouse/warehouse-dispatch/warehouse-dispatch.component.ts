import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {InputDistributionService} from '../../../core/services';
import {SiteService} from '../../../core/services/site.service';
import {LocationService} from '../../../core/services/location.service';
import {Subject} from 'rxjs';
import {WarehouseService} from '../../../core/services/warehouse.service';

@Component({
  selector: 'app-warehouse-dispatch',
  templateUrl: './warehouse-dispatch.component.html',
  styleUrls: ['./warehouse-dispatch.component.css']
})
export class WarehouseDispatchComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService, private warehouseService: WarehouseService,
              private router: Router, private inputDistributionService: InputDistributionService,
              private helper: HelperService, private locationService: LocationService) {
  }

  recordDispatchForm: FormGroup;
  errors: any;
  message: any;
  sites: any;
  provinces: any;
  districts: any;
  inputDispatches: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  stores: any;


  ngOnInit() {
    this.recordDispatchForm = this.formBuilder.group({
      entries: this.formBuilder.group({
        driver: ['', Validators.required],
        vehiclePlate: ['', Validators.required],
        vehicleModel: ['', Validators.required],
        numberOfBags: ['', Validators.required],
        totalQty: ['', Validators.required],
        date: ['', Validators.required],
        warehouseId: [''],
      }),
      siteId: ['', Validators.required],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: ['']
      }),
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.initial();
    this.getDispatches();
    this.onChanges();
    this.warehouseService.allEntries().subscribe((data) => {
      this.stores = data.content;
    });
  }

  onChanges() {
    this.recordDispatchForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
          });
          const body = {
            searchBy: 'province',
            prov_id: value
          };
          this.siteService.all(body).subscribe((data) => {
            this.sites = data.content;
          });
        }
      }
    );
    this.recordDispatchForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          const body = {
            searchBy: 'district',
            dist_id: value
          };
          this.siteService.all(body).subscribe((data) => {
            this.sites = data.content;
          });
        }
      });
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }

  onSubmit() {
    if (this.recordDispatchForm.valid) {
      const dispatch = JSON.parse(JSON.stringify(this.recordDispatchForm.value));
      delete dispatch.location;
      this.inputDistributionService.recordDispatch(dispatch)
        .subscribe(() => {
            this.message = 'Recorded successfully!';
            this.errors = '';
            this.warehouseService.getDispatches().subscribe((data) => {
              this.inputDispatches = data.content;
            });
          },
          (err) => {
            this.message = '';
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.recordDispatchForm);
    }
  }

  getDispatches() {
    this.loading = true;
    this.warehouseService.getDispatches().subscribe((data) => {
      this.loading = false;
      this.inputDispatches = data.content;
      this.dtTrigger.next();
    });
  }

  printNote(doc: string, subDoc: string) {
    const body = {
      docId: doc,
      subDocId: subDoc
    };
    this.warehouseService.printDeliveryNote(body).subscribe(() => {
    });
  }
}
