import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  AuthenticationService,
  ExcelServicesService,
  MessageService,
  OrganisationService,
  SiteService,
  UserService,
  Farmer,
  AuthorisationService,
  BasicComponent,
  FarmerService, HelperService, LocationService,
} from '../../../core';
import {ActivatedRoute} from '@angular/router';
import {FarmerDetailsComponent} from '../../farmer/farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {isArray, isObject} from 'util';
import {
  ParchmentReportDetailComponent
} from '../../reports/parchment-report/parchment-report-detail/parchment-report-detail.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {isEmptyObject} from 'jquery';
import {Subject} from 'rxjs';
import {DataTableDirective} from 'angular-datatables';

@Component({
  selector: 'app-organisation-farmers',
  templateUrl: './organisation-farmers.component.html',
  styleUrls: ['./organisation-farmers.component.css'],
})
export class OrganisationFarmersComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  cwsDashes: any;

  constructor(
    private organisationService: OrganisationService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private excelService: ExcelServicesService,
    private siteService: SiteService,
    protected locationService: LocationService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private modal: NgbModal,
    private helper: HelperService,
    private farmerService: FarmerService,
    private authorisationService: AuthorisationService
  ) {
    super();
  }

  farmers: any;
  paginatedFarmers: any;
  organisationId: string;
  // @ts-ignore
  loading = false;
  isUserCWSOfficer = true;
  org: any;
  site: any;
  numberOfTrees = 0;
  numberOfFarmers = 0;
  currentSeason: any;
  orgCoveredArea = [];
  allFarmers = [];
  cwsSummary = {
    totalCherries: 0,
    totalParchments: 0,
    expectedParchments: 0,
    totalNumberOfTrees: 0,
    totalNumberOfLands: 0,
    uniqueFarmersCount: 0,
  };
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  subRegionFilter: any;
  seasonStartingTime: string;
  filterForm: FormGroup;
  maxSize = 9;
  order = 'userInfo.foreName';
  reverse = true;
  directionLinks = true;
  message: string;
  showData = false;
  parameters: any;
  downloadingAll = true;
  config: any;
  autoHide = true;
  responsive = true;
  errors = [];
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`,
  };
  searchFields = [
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
    {value: 'groupname', name: 'group name'},
    {value: 'phone_number', name: 'phone number'},
  ];
  resetPin = true;
  showSetPinButton = true;
  as: string;
  isCurrentUserDCC = false;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  searchLocationBy = 'farm';
  filter: any;
  // @ts-ignore
  @ViewChild(DataTableDirective, {static: false})
  dtElement: DataTableDirective;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (!params['organisationId'.toString()]) {
        this.route.parent.params.subscribe((parameters) => {
          this.organisationId = parameters['organisationId'.toString()];
        });
      } else {
        this.organisationId = params['organisationId'.toString()];
      }
    });
    this.parameters = {
      length: 10,
      start: 0,
      draw: 1,
      org_id: this.organisationId,
    };
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.seasonStartingTime =
      this.authenticationService.getCurrentSeason().created_at;
    this.filterForm = this.formBuilder.group({
      searchByLocation: this.formBuilder.group({
        searchBy: ['farm_location'],
        prov_id: [{value: '', disabled: true}],
        dist_id: [{value: '', disabled: true}],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      searchByTerm: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['reg_number'],
      }),
    });
    this.subRegionFilter = {
      location: {
        searchBy: 'cws',
        cws_id: this.organisationId,
      },
      date: {
        from: this.seasonStartingTime,
        to: new Date(),
      },
    };
    this.getFarmers(this.organisationId);
    this.getPaginatedFarmers();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.organisationService.get(this.organisationId).subscribe((data) => {
      this.org = data.content;
      this.initial();
    });
    this.organisationService
      .getCwsSummary(this.organisationId)
      .subscribe((data) => {
        if (data.content.length) {
          this.cwsSummary = data.content[0];
        }
      });
    if (this.authenticationService.getCurrentUser().orgInfo.distributionSite) {
      this.siteService
        .get(
          this.authenticationService.getCurrentUser().orgInfo.distributionSite
        )
        .subscribe((data) => {
          this.site = data.content;
        });
    }
    this.setMessage(this.messageService.getMessage());
    this.orgCoveredArea = this.route.snapshot.data.orgCoveredAreaData;
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.getAllFarmers();
    this.getSetPinStatus();
    this.onChanges();
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.allFarmers, 'farmers');
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.organisationService.getFarmers(this.parameters).subscribe((data) => {
      this.paginatedFarmers = data.data;
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
      if (location) {
        if (location.prov_id === '') {
          filter.searchByLocation.filterBy = 'provinces';
        } else {
          if (this.searchLocationBy === 'farm') {
            location.prov_id = this.org.location.prov_id._id;
            location.dist_id = this.org.location.dist_id._id;
          }
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
            if (this.searchLocationBy !== 'farm') {
              filter.searchByLocation.filterBy = 'district';
              filter.searchByLocation.dist_id = location.dist_id;
            } else {
              delete filter.searchByLocation;
            }
          } else if (location.prov_id !== '') {
            filter.searchByLocation.filterBy = 'province';
            filter.searchByLocation.prov_id = location.prov_id;
          } else {
            delete filter.searchByLocation;
          }
        }
        this.helper.cleanObject(filter.searchByLocation);
      }
      if (!isEmptyObject(filter)) {
        this.parameters['search'.toString()] = filter;
      } else {
        delete this.parameters.search;
      }
      this.organisationService.getFarmers(this.parameters).subscribe(
        (data) => {
          this.paginatedFarmers = data.data;
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
    this.filterForm.controls.searchByTerm.get('term').setValue('', {emitEvent: false});
    this.filterForm.controls.searchByLocation.get('sect_id').setValue('', {emitEvent: false});
    this.filterForm.controls.searchByLocation.get('cell_id').setValue('', {emitEvent: false});
    this.filterForm.controls.searchByLocation.get('village_id').setValue('', {emitEvent: false});
    delete this.parameters.search;
    this.organisationService.getFarmers(this.parameters).subscribe((data) => {
      this.paginatedFarmers = data.data;
      this.config = {
        itemsPerPage: this.parameters.length,
        currentPage: this.parameters.start + 1,
        totalItems: data.recordsTotal,
      };
    });
  }

  getFarmers(orgId: string): void {
    this.organisationService.getOrgFarmers(orgId).subscribe((data) => {
      if (data) {
        this.farmers = data.content;
        this.farmers.map((farmer) => {
          farmer.request.requestInfo.map((land) => {
            this.numberOfTrees = this.numberOfTrees + land.numberOfTrees;
          });
        });
      }
    });
  }

  getPaginatedFarmers(): void {
    this.loading = true;
    this.organisationService.getFarmers(this.parameters).subscribe((data) => {
      if (data.data.length === 0) {
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: 0,
        };
        this.numberOfFarmers = 0;
      } else {
        this.paginatedFarmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal,
        };
        this.numberOfFarmers = data.recordsTotal;
      }
      this.showData = true;
      this.loading = false;
    });
  }

  hasRequest(farmer: any) {
    if (isArray(farmer.request.requestInfo)) {
      return farmer.request.requestInfo.length >= 0;
    } else {
      return isObject(farmer.request.requestInfo);
    }
  }

  showProduction() {
    const modalRef = this.modal.open(ParchmentReportDetailComponent, {
      size: 'lg',
    });
    modalRef.componentInstance.location = this.subRegionFilter;
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
  }

  getAllFarmers() {
    this.downloadingAll = true;
    this.organisationService
      .getAllFarmers(this.organisationId)
      .subscribe((data) => {
        this.downloadingAll = false;
        data.content.map((item) => {
          const temp = {
            NAMES: item.userInfo.type === 2 ? item.userInfo.groupName: (item.userInfo.surname + '  ' + item.userInfo.foreName),
            SEX: item.userInfo.sex,
            NID: item.userInfo.NID,
            PHONE: item.userInfo.phone_number,
            REG_NUMBER: item.userInfo.regNumber,
            PROVINCE: item.request[0].location.prov_id.namek,
            DISTRICT: item.request[0].location.dist_id.name,
            SECTOR: item.request[0].location.sect_id.name,
            CELL: item.request[0].location.cell_id.name,
            VILLAGE: item.request[0].location.village_id.name,
            NUMBER_OF_TREES: this.getNumberOfTrees(item.request),
          };
          this.allFarmers.push(temp);
        });
      });
  }

  getSetPinStatus() {
    this.showSetPinButton = false;
    this.organisationService.get(this.organisationId).subscribe((data) => {
      this.org = data.content;
      this.resetPin = this.org.isPinResetAllowed;
      this.showSetPinButton = true;
    });
  }

  enableResetPin(status: boolean) {
    this.showSetPinButton = false;
    this.organisationService
      .allowSetPinOrgUsers({
        org_id: this.org._id,
        status,
      })
      .subscribe(() => {
        this.getSetPinStatus();
      });
  }

  getNumberOfTrees = (requestInfo) => {
    let sum = 0;
    requestInfo.map((request) => {
      sum = sum + request.numberOfTrees;
    });
    return sum;
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      this.locationService
        .getDistricts(this.org.location.prov_id._id)
        .subscribe((dt) => {
          this.districts = dt;
          this.filterForm.controls.searchByLocation
            .get('prov_id'.toString())
            .patchValue(this.org.location.prov_id._id, {emitEvent: false});
          /* if (this.searchLocationBy === 'farm') {*/
          this.filterForm.controls.searchByLocation
            .get('dist_id'.toString())
            .patchValue(this.org.location.dist_id._id, {emitEvent: false});
          this.sectors = this.filterZoningSectors(this.org.coveredSectors);
          /*} else {
            this.filterForm.controls.searchByLocation
              .get('dist_id'.toString())
              .patchValue(this.org.location.dist_id._id, {emitEvent: true});
          }*/
        });

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
    /*this.filterForm.controls.searchByLocation.get('prov_id'.toString()).valueChanges.subscribe(
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
            /!*if (this.searchLocationBy === 'farm') {*!/
              this.sectors = this.filterZoningSectors( this.org.coveredSectors);
           /!* } else {
              this.sectors = data;
              this.filterForm.controls.searchByLocation
                .get('sect_id'.toString()).setValue('', {emitEvent: false});
            }*!/
            this.cells = null;
            this.villages = null;
            this.filterForm.controls.searchByLocation
              .get('cell_id'.toString()).setValue('', {emitEvent: false});
            this.filterForm.controls.searchByLocation
              .get('village_id'.toString()).setValue('', {emitEvent: false});
          });
        } else {
          /!*if (this.searchLocationBy !== 'farm') {
            this.sectors = null;
            this.filterForm.controls.searchByLocation
              .get('sect_id'.toString()).setValue('', {emitEvent: false});
          }*!/
          this.cells = null;
          this.villages = null;
          this.filterForm.controls.searchByLocation
            .get('cell_id'.toString()).setValue('', {emitEvent: false});
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});
        }
      }
    );*/
    this.filterForm.controls.searchByLocation
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getCells(value).subscribe((data) => {
          /* if (this.searchLocationBy === 'farm') {*/
          this.cells = this.filterZoningCells(this.org.coveredSectors, value);
          /*} else {
              this.cells = data;
          }*/
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
          /*  if (this.searchLocationBy === 'farm') {*/
          const id = this.filterForm.controls.searchByLocation
            .get('sect_id'.toString()).value;
          this.villages = this.filterZoningVillages(this.org.coveredSectors, id, data);
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});
          /*  } else {
              this.villages = data;
              this.filterForm.controls.searchByLocation
                .get('village_id'.toString()).setValue('', {emitEvent: false});
          }*/
        });
      }
    });
  }
}
