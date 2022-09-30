import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  ConfirmDialogService,
  FarmerService,
  MessageService,
  LocationService,
} from '../../../core';
import { Router } from '@angular/router';
import { Farmer } from '../../../core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FarmerDetailsComponent } from '../farmer-details/farmer-details.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isArray, isObject } from 'util';
import { BasicComponent } from '../../../core';
import { HelperService } from '../../../core';

@Component({
  selector: 'app-farmer-list',
  templateUrl: './farmer-list.component.html',
  styleUrls: ['./farmer-list.component.css'],
})
export class FarmerListComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  isDistrictCashCrop = false;
  filterForm: FormGroup;
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
    { value: 'phone_number', name: 'phone number' },
    { value: 'reg_number', name: 'registration number' },
    { value: 'nid', name: 'NID' },
    { value: 'forename', name: 'first name' },
    { value: 'surname', name: 'last name' },
    { value: 'location', name: 'location' },
    { value: 'groupname', name: 'group name' },
  ];
  as: string;
  isCurrentUserDCC = false;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  distId = false;
  sectorId = false;
  cellId = false;
  villageId = false;
  private searchLocationBy = 'farm';

  constructor(
    private farmerService: FarmerService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private authorisationService: AuthorisationService,
    private helper: HelperService,
    private modal: NgbModal,
    private formBuilder: FormBuilder,
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
    // this.filterForm =

    if (this.isDistrictCashCrop) {
      this.as = 'dcc';
      this.parameters['dist_id'.toString()] =
        this.authenticationService.getCurrentUser().info.location.dist_id;
    }
    this.getFarmers();
    this.message = this.messageService.getMessage();

    this.filterForm = this.formBuilder.group({
      searchByLocation: this.formBuilder.group({
        searchBy: ['farm_location'],
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      searchByTerm: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['nid'],
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

      console.log(filter)

      if (filter.searchByTerm.term === '') {
        delete filter.searchByTerm;
      }

      const location = filter.searchByLocation;

      // if no
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
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.errors = [];

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
    const modalRef = this.modal.open(FarmerDetailsComponent, { size: 'lg' });
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

  onSubmit(searchBy: string) {
    if (this.filterForm.valid) {
      this.loading = true;
      const filter = JSON.parse(JSON.stringify(this.filterForm.value));

      if (filter.location.prov_id === '' && searchBy === 'province') {
        this.parameters['filterBy'.toString()] = 'all provinces';
      } else {
        this.parameters['filterBy'.toString()] = searchBy;
        if (searchBy === 'province') {
          this.parameters['prov_id'.toString()] = filter.location.prov_id;
        } else {
          delete this.parameters['prov_id'.toString()];
        }
        if (searchBy === 'district') {
          this.parameters['dist_id'.toString()] = filter.location.dist_id;
        } else {
          delete this.parameters['dist_id'.toString()];
        }
        if (searchBy === 'sector') {
          this.parameters['sect_id'.toString()] = filter.location.sect_id;
        } else {
          delete this.parameters['sect_id'.toString()];
        }
        if (searchBy === 'cell') {
          this.parameters['cell_id'.toString()] = filter.location.cell_id;
        } else {
          delete this.parameters['cell_id'.toString()];
        }
        if (searchBy === 'village') {
          this.parameters['village_id'.toString()] = filter.location.village_id;
        } else {
          delete this.parameters['village_id'.toString()];
        }
      }

      if (filter.location.search_by_location === 'farm_location') {
        this.farmerService.administrativeList(this.parameters).subscribe(
          (data) => {
            if (data.data.length > 0) {
              this.farmers = data.data;
              this.config = {
                itemsPerPage: this.parameters.length,
                currentPage: this.parameters.start + 1,
                totalItems: data.recordsTotal,
              };
              this.loading = false;
              this.showData = true;
              this.clear();
            } else {
              this.farmers = data.data;
              this.showData = false;
              this.setMessage('Sorry no farmers found!');
            }
          },
          (err) => {
            this.setError(err.errors);
          }
        );
      }
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      if (this.isCurrentUserDCC) {
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

  onChanges() {
    this.filterForm.controls.searchByLocation
      .get('searchBy'.toString())
      .valueChanges.subscribe((value) => {
      if (value === 'farm_location') {
        this.searchLocationBy = 'farm';
        /* this.filterForm.controls.searchByLocation
          .get('prov_id'.toString()).setValue(this.org.location.prov_id._id, {emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('dist_id'.toString()).setValue(this.org.location.dist_id._id, {emitEvent: true});
        this.filterForm.controls.searchByLocation
          .get('prov_id'.toString()).disable({emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('dist_id'.toString()).disable({emitEvent: false});
        this.sectors = this.filterZoningSectors(this.org.coveredSectors);*/
      } else {
        this.searchLocationBy = 'farmer';
        /*this.filterForm.controls.searchByLocation
          .get('dist_id'.toString()).setValue(this.org.location.dist_id._id, {emitEvent: true});*/
        /*this.filterForm.controls.searchByLocation
          .get('prov_id'.toString()).enable({emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('dist_id'.toString()).enable({emitEvent: true});*/
      }
      /*this.filterForm.controls.searchByLocation
    .get('prov_id'.toString()).setValue(this.org.location.prov_id._id, {emitEvent: false});
  this.filterForm.controls.searchByLocation
    .get('dist_id'.toString()).setValue(this.org.location.dist_id._id, {emitEvent: true});
  this.filterForm.controls.searchByLocation
    .get('prov_id'.toString()).disable({emitEvent: false});
  this.filterForm.controls.searchByLocation
    .get('dist_id'.toString()).disable({emitEvent: false});
  this.sectors = this.filterZoningSectors(this.org.coveredSectors);
  this.cells = null;
  this.villages = null;*/
    });

    this.filterForm.controls.searchByLocation.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            if (this.searchLocationBy !== 'farm') {
              this.sectors = null;
              this.filterForm.controls.searchByLocation
                .get('sect_id'.toString()).setValue('', {emitEvent: false});
            }
            this.cells = null;
            this.villages = null;
          });
        } else {
          if (this.searchLocationBy !== 'farm') {
            this.districts = null;
            this.sectors = null;
            this.filterForm.controls.searchByLocation
              .get('dist_id'.toString()).setValue('', {emitEvent: false});
            this.filterForm.controls.searchByLocation
              .get('sect_id'.toString()).setValue('', {emitEvent: false});
          }
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
            this.cells = null;
            this.villages = null;
            this.filterForm.controls.searchByLocation
              .get('cell_id'.toString()).setValue('', {emitEvent: false});
            this.filterForm.controls.searchByLocation
              .get('village_id'.toString()).setValue('', {emitEvent: false});
          });
        } else {
          if (this.searchLocationBy !== 'farm') {
            this.sectors = null;
            this.filterForm.controls.searchByLocation
              .get('sect_id'.toString()).setValue('', {emitEvent: false});
          }
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
}