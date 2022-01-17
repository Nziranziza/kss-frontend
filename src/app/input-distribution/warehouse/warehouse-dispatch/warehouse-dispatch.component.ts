import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {
  AuthenticationService,
  ConfirmDialogService,
  ExcelServicesService,
  InputDistributionService,
  SeasonService
} from '../../../core/services';
import {SiteService} from '../../../core/services';
import {LocationService} from '../../../core/services';
import {Subject} from 'rxjs';
import {WarehouseService} from '../../../core/services';
import {DatePipe} from '@angular/common';
import {BasicComponent} from '../../../core/library';
import {DataTableDirective} from 'angular-datatables';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {WarehouseDispatchEditComponent} from '../warehouse-dispatch-edit/warehouse-dispatch-edit.component';
import DateTimeFormat = Intl.DateTimeFormat;

declare var $;

@Component({
  selector: 'app-warehouse-dispatch',
  templateUrl: './warehouse-dispatch.component.html',
  providers: [DatePipe],
  styleUrls: ['./warehouse-dispatch.component.css']
})
export class WarehouseDispatchComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private warehouseService: WarehouseService,
              private router: Router, private confirmDialogService: ConfirmDialogService,
              private seasonService: SeasonService,
              private modal: NgbModal,
              private excelService: ExcelServicesService,
              private wareHouseService: WarehouseService,
              private datePipe: DatePipe, private authenticationService: AuthenticationService,
              private inputDistributionService: InputDistributionService,
              private helper: HelperService, private locationService: LocationService) {
    super();
  }

  recordDispatchForm: FormGroup;
  filterForm: FormGroup;
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
  printDispatches = [];
  searchFields = [
    {value: 'no_filter', name: 'search by...'},
    {value: 'input_type', name: 'input type'},
    {value: 'site', name: 'site'},
    {value: 'driver', name: 'driver'},
    {value: 'vehicle', name: 'vehicle'}
  ];

  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

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
        date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2'), Validators.required],
        packageFertilizer: new FormArray([]),
        packagePesticide: new FormArray([]),
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
      }, {}, {}, {}],
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
    const self = this;
    $('.responsive-table').on('click', 'a.cancel-entry', function(e) {
      const data = $(this).attr('id').split('-');
      e.preventDefault();
      self.cancelDispatchEntry(data[0], data[1]);
    });
    this.initial();
    this.getDispatches();
    this.onChanges();
    this.getStocks(1);
    this.addPackageFertilizer();
    this.getCurrentSeason();
  }

  cancelDispatchEntry(dispatchId: string, subDocumentId: string) {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel this item? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            dispatchId,
            subDocumentId
          };
          this.wareHouseService.removeDispatchEntry(body).subscribe(() => {
            this.setMessage('Dispatch entry successfully cancelled!');
            this.getDispatches();
          }, (err) => {
            this.setError(this.errors = err.errors);
            window.scroll(0, 0);
          });
        }
      });
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
      } else {
        filter.date.from = this.helper.getDate(this.filterForm.value.date.from);
        filter.date.to = this.helper.getDate(this.filterForm.value.date.to);
      }
      this.helper.cleanObject(filter.search);
      this.helper.cleanObject(filter);
      delete filter.search.location;
      this.warehouseService.filterDispatches(filter).subscribe((data) => {
        this.inputDispatches = data.content;
        this.createExcelData(this.inputDispatches);
        this.rerender();
      }, (err) => {
        if (err.status === 404) {
          this.setWarning('Sorry no matching data');
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
      this.createExcelData(this.inputDispatches);
      this.rerender();
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
      this.helper.getDate(this.recordDispatchForm.value.entries.date);
      delete dispatch.location;
      const body = {
        siteId: dispatch.siteId,
        vehicleModel: dispatch.entries.vehicleModel,
        vehiclePlate: dispatch.entries.vehiclePlate,
        date: this.helper.getDate(this.recordDispatchForm.value.entries.date),
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
            this.setMessage('Dispatch recorded successfully!');
            this.warehouseService.getDispatches().subscribe((data) => {
              this.inputDispatches = data.content;
              this.createExcelData(this.inputDispatches);
              this.rerender();
            });
            this.recordDispatchForm.reset();
            this.recordDispatchForm.controls.entries.get('date').setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2'));
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.recordDispatchForm));
    }
  }

  createExcelData(dispatches) {
    dispatches.map((item) => {
      const temp = {
        SITE_NAME: item.destinationSite.siteId.siteName,
        PROVINCE: item.destinationSite.location.prov_id.namek,
        DISTRICT: item.destinationSite.location.dist_id.name,
        SECTOR: item.destinationSite.location.sect_id.name,
        NPK_22_6_12_3S: item.entries.find(entry => entry.inputId.inputName === 'NPK 22-6-12+3S') ?
          item.entries.find(entry => entry.inputId.inputName === 'NPK 22-6-12+3S').totalQty : '',
        Agropy_EWS_PLUS: item.entries.find(entry => entry.inputId.inputName === 'Agropy EWC PLUS') ?
          item.entries.find(entry => entry.inputId.inputName === 'Agropy EWC PLUS').totalQty : '',
        Alpha_cypermetrin_10_EC: item.entries.find(entry => entry.inputId.inputName === 'Alpha cypermetrin 10 EC') ?
          item.entries.find(entry => entry.inputId.inputName === 'Alpha cypermetrin 10 EC').totalQty : '',
        RECEIVED: item.receivedBy ? 'Received' : '',
        RECEIVED_BY: item.receivedBy ? `${item.receivedBy.foreName} ${item.receivedBy.surname}`: '',
        PHONE_NUMBER: item.receivedBy && item.receivedBy.phoneNumber ? item.receivedBy.phoneNumber: '' ,
        CWS: item.receivedBy && item.receivedBy.org_id ? item.receivedBy.org_id.organizationName: '',
        DISPATCHED_ON: this.datePipe.transform(new Date(item.created_at), 'yyyy-MM-dd', 'GMT+2')
      };
      this.printDispatches.push(temp);
    });
  }

  getDispatches() {
    this.loading = true;
    this.warehouseService.getDispatches().subscribe((data) => {
      this.loading = false;
      this.inputDispatches = data.content;
      this.createExcelData(this.inputDispatches);
      this.dtTrigger.next();
    });
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.printDispatches, 'dispatches');
  }

  printNote(id: string) {
    this.clear();
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

  editDistribution(id: string) {
    const modalRef = this.modal.open(WarehouseDispatchEditComponent, {size: 'lg'});
    modalRef.componentInstance.id = id;
    modalRef.result.then((message) => {
      this.setMessage(message);
    });
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
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel the dispatch? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            id
          };
          this.wareHouseService.removeDispatch(body).subscribe(() => {
            this.setMessage('Dispatch successfully cancelled!');
            this.inputDispatches = this.inputDispatches.filter((value) => {
              return value._id !== id;
            });
            this.createExcelData(this.inputDispatches);
          }, (err) => {
            this.setError(this.errors = err.errors);
            window.scroll(0, 0);
          });
        }
      });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}
