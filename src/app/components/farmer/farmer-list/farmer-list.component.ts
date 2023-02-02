import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  ConfirmDialogService,
  FarmerService,
  MessageService,
  LocationService,
} from '../../../core';
import {Router} from '@angular/router';
import {Farmer} from '../../../core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {isArray, isObject} from 'util';
import {BasicComponent} from '../../../core';
import {HelperService} from '../../../core';

@Component({
  selector: 'app-farmer-list',
  templateUrl: './farmer-list.component.html',
  styleUrls: ['./farmer-list.component.css'],
})
export class FarmerListComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  isDistrictCashCrop = false;
  filterForm: UntypedFormGroup;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  message: string;
  farmers = [];
  showData = false;
  title = 'Farmers';
  id = 'farmers-list';
  parameters: any;
  config: any;
  autoHide = false;
  responsive = false;
  errors = [];
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`,
  };
  loading = true;
  searchFields = [
    {value: 'phone_number', name: 'phone number'},
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
    {value: 'location', name: 'location'},
    {value: 'groupname', name: 'group name'},
  ];
  as: string;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  distId = false;
  sectorId = false;
  cellId = false;
  villageId = false;
  searchLocationBy = 'farm';

  constructor(
    private farmerService: FarmerService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private authorisationService: AuthorisationService,
    private helper: HelperService,
    private modal: NgbModal,
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private locationService: LocationService
  ) {
    super();
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1,
    };
  }

  ngOnInit(): void {
    this.redirect();
    this.isDistrictCashCrop =
      this.authorisationService.isDistrictCashCropOfficer();

    if (this.isDistrictCashCrop) {
      this.as = 'dcc';
    }
    this.getFarmers();
    this.message = this.messageService.getMessage();
    this.filterForm = this.formBuilder.group({
      searchByLocation: this.formBuilder.group({
        searchBy: [{ value: 'farm_location', disabled: true}],
        prov_id: [{
          value: (this.authorisationService.isDistrictCashCropOfficer() ?
            this.authenticationService.getCurrentUser().info.location.prov_id : ''),
          disabled: this.isDistrictCashCrop
        }],
        dist_id: [{
          value: (this.authorisationService.isDistrictCashCropOfficer() ?
            this.authenticationService.getCurrentUser().info.location.dist_id : ''),
          disabled: this.isDistrictCashCrop
        }],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      searchByTerm: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['reg_number'],
      }),
    });
    this.initial();
    this.onChanges();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.farmerService
      .getFarmers(this.parameters, this.as)
      .subscribe((data) => {
        this.farmers = data.data;
      });
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      const filter = JSON.parse(JSON.stringify(this.filterForm.value));
      if (filter.searchByTerm.term === '') {
        delete filter.searchByTerm;
      }
      const location = filter.searchByLocation;
      filter.searchByLocation.searchBy = filter.searchByLocation.searchBy || this.searchLocationBy;
      if (location.prov_id === '') {
        filter.searchByLocation.filterBy = 'all provinces';
      } else {
        if (location.village_id !== '') {
          filter.searchByLocation.filterBy = 'village';
          filter.searchByLocation.village_id = location.village_id;
        } else if (location.cell_id !== '') {
          filter.searchByLocation.filterBy = 'cell';
          filter.searchByLocation.cell_id = location.cell_id;
        } else if (location.sect_id !== '') {
          filter.searchByLocation.filterBy = 'sector';
          filter.searchByLocation.sect_id = location.sect_id;
        } else if (location.dist_id !== '') {
          filter.searchByLocation.filterBy = 'district';
          filter.searchByLocation.dist_id = location.dist_id;
        } else if (location.prov_id !== '') {
          filter.searchByLocation.filterBy = 'province';
          filter.searchByLocation.prov_id = location.prov_id;
        } else {
          delete filter.searchByLocation;
        }
      }

      this.helper.cleanObject(filter.searchByLocation);
      this.parameters['search'.toString()] = filter;
      this.farmerService.getFarmers(this.parameters, this.as).subscribe(
        (data) => {
          this.farmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal,
          };
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.errors = err.errors;
        }
      );
    }
  }
  onClearFilter() {
    this.filterForm.controls.searchByTerm.get('term').setValue('', { emitEvent: false });
    this.filterForm.controls.searchByLocation.get('sect_id').setValue('', { emitEvent: false });
    this.filterForm.controls.searchByLocation.get('cell_id').setValue('', { emitEvent: false });
    this.filterForm.controls.searchByLocation.get('village_id').setValue('', { emitEvent: false });
    delete this.parameters.search;
    this.farmerService
      .getFarmers(this.parameters, this.as)
      .subscribe((data) => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal,
        };
      });
  }

  deleteFarmer(farmer: Farmer): void {
    this.confirmDialogService
      .openConfirmDialog('Are you sure you want to delete this record?')
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.farmerService.destroy(farmer._id).subscribe((data) => {
            this.message = 'Record successful deleted!';
          });
        }
      });
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }



  getFarmers() {
    this.loading = true;
    this.farmerService
      .getFarmers(this.parameters, this.as)
      .subscribe((data) => {
        this.farmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal,
        };
        this.showData = true;
        this.loading = false;
      });
  }

  redirect() {
    this.messageService.setMessage(this.messageService.getMessage());
    if (this.authorisationService.isCWSUser()) {
      this.router.navigateByUrl(
        '/admin/cws-farmers/' +
        this.authenticationService.getCurrentUser().info.org_id
      );
    }
  }

  hasRequest(farmer: any) {
    if (isArray(farmer.request)) {
      if (farmer.request.length < 0) {
        return false;
      }
    } else {
      return isObject(farmer.request);
    }
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
  }

  onChanges() {
    this.filterForm.controls.searchByLocation
      .get('searchBy'.toString())
      .valueChanges.subscribe((value) => {
      if (value === 'farm_location') {
        this.searchLocationBy = 'farm';
      } else {
        this.searchLocationBy = 'farmer';
      }
    });
    this.filterForm.controls.searchByLocation.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.filterForm.controls.searchByLocation
              .get('sect_id'.toString()).setValue('', {emitEvent: false});
            this.cells = null;
            this.villages = null;
          });
        } else {

          this.districts = null;
          this.sectors = null;
          this.filterForm.controls.searchByLocation
            .get('dist_id'.toString()).setValue('', {emitEvent: false});
          this.filterForm.controls.searchByLocation
            .get('sect_id'.toString()).setValue('', {emitEvent: false});

          this.cells = null;
          this.villages = null;
        }
        this.filterForm.controls.searchByLocation
          .get('cell_id'.toString()).setValue('', {emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('village_id'.toString()).setValue('', {emitEvent: false});
      }
    );
    this.filterForm.controls.searchByLocation.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.filterForm.controls.searchByLocation
              .get('sect_id'.toString()).setValue('', {emitEvent: false});
          });
          this.cells = null;
          this.villages = null;
          this.filterForm.controls.searchByLocation
            .get('cell_id'.toString()).setValue('', {emitEvent: false});
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});
        } else {

          this.sectors = null;
          this.filterForm.controls.searchByLocation
            .get('sect_id'.toString()).setValue('', {emitEvent: false});
          this.cells = null;
          this.villages = null;
          this.filterForm.controls.searchByLocation
            .get('cell_id'.toString()).setValue('', {emitEvent: false});
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});
        }
      }
    );
    this.filterForm.controls.searchByLocation
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getCells(value).subscribe((data) => {
          this.cells = data;
          this.villages = null;
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});
        });
      } else {
        this.cells = null;
        this.villages = null;
        this.filterForm.controls.searchByLocation
          .get('cell_id'.toString()).setValue('', {emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('village_id'.toString()).setValue('', {emitEvent: false});
      }
    });
    this.filterForm.controls.searchByLocation
      .get('cell_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getVillages(value).subscribe((data) => {
          this.villages = data;
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});

        });
      }
    });
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      if (this.isDistrictCashCrop) {
        this.filterForm.controls.location
          .get('prov_id'.toString())
          .patchValue(
            this.authenticationService.getCurrentUser().info.location.prov_id
          );
        this.filterForm.controls.location
          .get('dist_id'.toString())
          .patchValue(
            this.authenticationService.getCurrentUser().info.location.dist_id
          );
      }
    });
  }
}
