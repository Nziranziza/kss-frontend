import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, ConfirmDialogService, InputDistributionService, SeasonService} from '../../../core/services';
import {SiteService} from '../../../core/services';
import {LocationService} from '../../../core/services';
import {Subject} from 'rxjs';
import {WarehouseService} from '../../../core/services';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-warehouse-dispatch',
  templateUrl: './warehouse-dispatch.component.html',
  providers: [DatePipe],
  styleUrls: ['./warehouse-dispatch.component.css']
})
export class WarehouseDispatchComponent implements OnInit, OnDestroy {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private warehouseService: WarehouseService,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private datePipe: DatePipe, private authenticationService: AuthenticationService,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService, private locationService: LocationService) {
  }

  recordDispatchForm: FormGroup;
  filterForm: FormGroup;
  errors = [];
  message: any;
  sites: any;
  provinces: any;
  districts: any;
  filterProvinces: any;
  filterDistricts: any;
  filterSites: any;
  isFilterBySite = false;
  inputDispatches: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  includeFertilizer = true;
  includePesticide = false;
  currentDate: any;
  isFilterByType = false;
  searchFields = [
    {value: 'no_filter', name: 'search by...'},
    {value: 'input_type', name: 'input type'},
    {value: 'site', name: 'site'},
    {value: 'driver', name: 'driver'},
    {value: 'vehicle', name: 'vehicle'}
  ];
  packagePesticide: any;
  packageFertilizer: any;
  totalQtyFertilizer = 0;
  totalQtyPesticide = 0;
  stocks: any;
  fertilizerStocks: any;
  pesticideStocks: any;
  season: any;

  ngOnInit() {
    this.currentDate = new Date();
    this.recordDispatchForm = this.formBuilder.group({
      entries: this.formBuilder.group({
        driver: [''],
        driverPhoneNumber: [''],
        vehiclePlate: [''],
        vehicleModel: [''],
        date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required],
        packageFertilizer: new FormArray([]),
        packagePesticide: new FormArray([]),
        warehouseIdFertilizer: [''],
        warehouseIdPesticide: [''],
        totalQtyPesticide: [0],
        totalQtyFertilizer: [0]
      }),
      siteId: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: ['']
      })
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      columns: [{}, {}, {}, {}, {
        class: 'none'
      }, {}, {}],
      responsive: true
    };
    this.filterForm = this.formBuilder.group({
      search: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        location: this.formBuilder.group({
          prov_id: [''],
          dist_id: ['']
        }),
        siteId: [''],
        searchBy: ['no_filter', Validators.required]
      }),
      date: this.formBuilder.group({
        from: [''],
        to: ['']
      })
    });
    this.initial();
    this.getDispatches();
    this.onChanges();
    this.getStocks(1);
    this.addPackageFertilizer();
    this.getCurrentSeason();
  }

  get formPackageFertilizer() {
    return this.recordDispatchForm.controls.entries.get('packageFertilizer') as FormArray;
  }

  get formPackagePesticide() {
    return this.recordDispatchForm.controls.entries.get('packagePesticide') as FormArray;
  }

  addPackageFertilizer() {
    (this.recordDispatchForm.controls.entries.get('packageFertilizer') as FormArray).push(this.createPackageFertilizer());
  }

  addPackagePesticide() {
    (this.recordDispatchForm.controls.entries.get('packagePesticide') as FormArray).push(this.createPackagePesticide());
  }

  removePackageFertilizer(index: number) {
    (this.recordDispatchForm.controls.entries.get('packageFertilizer') as FormArray).removeAt(index);
  }

  removePackagePesticide(index: number) {
    (this.recordDispatchForm.controls.entries.get('packagePesticide') as FormArray).removeAt(index);
  }

  getPackageFertilizerFormGroup(index): FormGroup {
    this.packageFertilizer = this.recordDispatchForm.controls.entries.get('packageFertilizer') as FormArray;
    return this.packageFertilizer.controls[index] as FormGroup;
  }

  getPackagePesticideFormGroup(index): FormGroup {
    this.packagePesticide = this.recordDispatchForm.controls.entries.get('packagePesticide') as FormArray;
    return this.packagePesticide.controls[index] as FormGroup;
  }

  createPackageFertilizer(): FormGroup {
    return this.formBuilder.group({
      bagSize: [''],
      numberOfBags: [''],
      subTotal: ['']
    });
  }

  createPackagePesticide(): FormGroup {
    return this.formBuilder.group({
      pesticideType: [''],
      qty: ['']
    });
  }

  onChangePackageFertilizer(index: number) {
    let value: { bagSize: string | number; numberOfBags: string | number; };
    value = this.formPackageFertilizer.value[index];
    let removed = false;
    this.formPackageFertilizer.value.forEach((el, i) => {
      if (((value.bagSize) === el.bagSize) && (this.formPackageFertilizer.value.length > 1) && (i !== index)) {
        this.removePackageFertilizer(index);
        removed = true;
      }
    });
    if (!removed) {
      const subTotal = (+value.bagSize) * (+value.numberOfBags);
      this.getPackageFertilizerFormGroup(index).controls['subTotal'.toString()].setValue(subTotal);
    }
  }

  onChangePackagePesticide(index: number) {
    const value = this.formPackagePesticide.value[index];
    this.formPackagePesticide.value.forEach((el, i) => {
      if ((value.pesticideType === el.pesticideType) && (this.formPackagePesticide.value.length > 1) && (i !== index)) {
        this.removePackagePesticide(index);
      }
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

    this.filterForm.controls.search.get('location'.toString()).get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value) {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.filterDistricts = data;
          });
          const body = {
            searchBy: 'province',
            prov_id: value
          };
          this.siteService.all(body).subscribe((data) => {
            this.filterSites = data.content;
          });
        }
      });

    this.formPackagePesticide.valueChanges.subscribe((values) => {
      this.totalQtyPesticide = 0;
      values.forEach((value) => {
        if (value.qty !== '') {
          this.totalQtyPesticide = this.totalQtyPesticide + (+value.qty);
        }
      });
      this.recordDispatchForm.controls.entries.get('totalQtyPesticide').setValue(this.totalQtyPesticide);
    });

    this.formPackageFertilizer.valueChanges.subscribe((values) => {
      this.totalQtyFertilizer = 0;
      values.forEach((value) => {
        if (value.bagSize && value.numberOfBags) {
          this.totalQtyFertilizer = this.totalQtyFertilizer + (+value.bagSize) * (+value.numberOfBags);
        }
      });
      this.recordDispatchForm.controls.entries.get('totalQtyFertilizer').setValue(this.totalQtyFertilizer);
    });
    this.filterForm.controls.search.get('location'.toString()).get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value) {
          const body = {
            searchBy: 'district',
            dist_id: value
          };
          this.siteService.all(body).subscribe((data) => {
            this.filterSites = data.content;
          });
        }
      }
    );
    this.filterForm.controls.search.get('searchBy'.toString()).valueChanges.subscribe(
      (value) => {
        this.isFilterBySite = value === 'site';
        this.isFilterByType = value === 'input_type';
        if (this.isFilterByType) {
          this.filterForm.controls.search.get('term'.toString()).setValue('Fertilizer');
        } else {
          this.filterForm.controls.search.get('term'.toString()).setValue('');
        }
      });
  }

  onFilter() {
    if (this.filterForm.valid) {
      const filter = JSON.parse(JSON.stringify(this.filterForm.value));
      if ((!filter.date.from) || (!filter.date.to)) {
        delete filter.date;
      }
      this.helper.cleanObject(filter.search);
      this.helper.cleanObject(filter);
      delete filter.search.location;
      this.warehouseService.filterDispatches(filter).subscribe((data) => {
        this.inputDispatches = data.content;
      }, (err) => {
        if (err.status === 404) {
          this.inputDispatches = [];
        }
      });
    }
  }

  onClearFilter() {
    this.filterForm.reset();
    this.filterForm.controls.search.get('searchBy').setValue('no_filter');
    this.warehouseService.getDispatches().subscribe((data) => {
      this.inputDispatches = data.content;
    });
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      this.filterProvinces = data;
    });
  }

  onSubmit() {
    if (this.recordDispatchForm.valid) {
      const dispatch = JSON.parse(JSON.stringify(this.recordDispatchForm.value));
      delete dispatch.location;
      const body = {
        siteId: dispatch.siteId,
        vehicleModel: dispatch.entries.vehicleModel,
        vehiclePlate: dispatch.entries.vehiclePlate,
        date: dispatch.entries.date,
        driver: dispatch.entries.driver,
        driverPhoneNumber: dispatch.entries.driverPhoneNumber,
        entries: []
      };
      if (this.includePesticide) {
        dispatch.entries.packagePesticide.forEach((pe) => {
          const id = this.pesticideStocks.find(s => s.inputId._id === pe.pesticideType)
            ? this.pesticideStocks.find(s => s.inputId._id === pe.pesticideType)._id : '';
          const el = {
            stockId: id,
            numberOfItems: 1,
            totalQty: +pe.qty
          };
          body.entries.push(el);
        });
      }
      if (this.includeFertilizer) {
        dispatch.entries.packageFertilizer.forEach((fe) => {
          const id = this.fertilizerStocks.find(s => s.quantityPerItem === +fe.bagSize)
            ? this.fertilizerStocks.find(s => s.quantityPerItem === +fe.bagSize)._id : '';
          const el = {
            stockId: id,
            numberOfItems: +fe.numberOfBags,
            totalQty: +fe.subTotal
          };
          body.entries.push(el);
        });
      }
      this.inputDistributionService.recordDispatch(body)
        .subscribe(() => {
            this.message = 'Recorded successfully!';
            this.errors = [];
            this.warehouseService.getDispatches().subscribe((data) => {
              this.inputDispatches = data.content;
            });
            this.recordDispatchForm.controls.entries.get('date').setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'));
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

  printNote(id: string) {
    this.errors = [];
    this.warehouseService.printDeliveryNote(id).subscribe((data) => {
      const byteArray = new Uint8Array(atob(data.data).split('').map(char => char.charCodeAt(0)));
      const newBlob = new Blob([byteArray], {type: 'application/pdf'});
      const linkElement = document.createElement('a');
      const url = URL.createObjectURL(newBlob);
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', data.fileName + '.pdf');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      linkElement.dispatchEvent(clickEvent);
    });
  }

  onIncludeFertilizer() {
    this.includeFertilizer = !this.includeFertilizer;
    if (this.recordDispatchForm.value.entries.packageFertilizer.length === 0) {
      this.addPackageFertilizer();
    }
  }

  onIncludePesticide() {
    this.includePesticide = !this.includePesticide;
    if (this.recordDispatchForm.value.entries.packagePesticide.length === 0) {
      this.addPackagePesticide();
    }
  }

  getStocks(stock: number) {
    this.inputDistributionService.getStock(stock).subscribe((data) => {
      this.stocks = data.content;
      this.fertilizerStocks = this.stocks.filter(s => s.inputId.inputType === 'Fertilizer');
      this.pesticideStocks = this.stocks.filter(s => s.inputId.inputType === 'Pesticide');
    });
  }

  getCurrentSeason() {
    this.seasonService.all().subscribe((dt) => {
      const seasons = dt.content;
      seasons.forEach((item) => {
        if (item.isCurrent) {
          this.season = item;
        }
      });
    });
  }

  cancelDispatch(id: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel dispatch? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
        }
      });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

}
