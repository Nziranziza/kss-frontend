import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AuthenticationService,
  AuthorisationService,
  ExcelServicesService, FarmerService, LocationService,
  OrganisationService,
  OrganisationTypeService
} from '../../../core';
import {HelperService} from '../../../core';
import {Farmer} from '../../../core';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BasicComponent} from '../../../core';

@Component({
  selector: 'app-farmer-administrative-list',
  templateUrl: './farmer-administrative-list.component.html',
  styleUrls: ['./farmer-administrative-list.component.css']
})
export class FarmerAdministrativeListComponent extends BasicComponent implements OnInit {

  title = 'Farmers administrative list';
  filterForm: FormGroup;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  loading = false;
  showData = false;
  distId = false;
  sectorId = false;
  cellId = false;
  villageId = false;
  farmers = [];
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  id = 'farmers-list';
  isCurrentUserDCC = false;
  parameters: any;
  config: any;
  autoHide = false;
  responsive = false;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  printable: any;

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private locationService: LocationService,
              private farmerService: FarmerService,
              private modal: NgbModal,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
  ) {
    super();
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.filterForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      })
    });
    this.initial();
    this.onChanges();
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
      this.farmerService.administrativeList(this.parameters).subscribe((data) => {
        if (data.data.length > 0) {
          this.farmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.loading = false;
          this.showData = true;
          this.clear();
        } else {
          this.farmers = data.data;
          this.showData = false;
          this.setMessage('Sorry no farmers found!');
        }
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  onChanges() {
    this.filterForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
        }
      }
    );
    this.filterForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
            this.distId = true;
          });
        } else {
          this.distId = false;
        }
      }
    );
    this.filterForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
            this.sectorId = true;
          });
        } else {
          this.sectorId = false;
        }
      }
    );
    this.filterForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
            this.cellId = true;
          });
        } else {
          this.cellId = false;
        }
      }
    );
    this.filterForm.controls.location.get('village_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.villageId = value !== '';
      }
    );
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  exportList() {
    this.excelService.exportAsExcelFile(this.printable, 'farmers-list');
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.farmerService.administrativeList(this.parameters).subscribe((data) => {
      this.farmers = data.data;
    });
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      if (this.isCurrentUserDCC) {
        this.filterForm.controls.location.get('prov_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.prov_id);
        this.filterForm.controls.location.get('dist_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.dist_id);
      }
    });
  }
}
