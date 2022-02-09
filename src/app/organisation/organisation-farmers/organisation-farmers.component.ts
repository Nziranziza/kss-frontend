import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  AuthenticationService,
  ExcelServicesService,
  MessageService,
  OrganisationService,
  SiteService,
  UserService
} from '../../core';
import {ActivatedRoute} from '@angular/router';
import {Farmer} from '../../core';
import {FarmerDetailsComponent} from '../../farmer/farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorisationService} from '../../core';
import {isArray, isObject} from 'util';
import {BasicComponent} from '../../core';
import {ParchmentReportDetailComponent} from '../../reports/parchment-report/parchment-report-detail/parchment-report-detail.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-organisation-farmers',
  templateUrl: './organisation-farmers.component.html',
  styleUrls: ['./organisation-farmers.component.css']
})
export class OrganisationFarmersComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private userService: UserService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private siteService: SiteService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private modal: NgbModal, private authorisationService: AuthorisationService) {
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
    uniqueFarmersCount: 0
  };
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
    screenReaderCurrentLabel: `You're on page`
  };
  searchFields = [
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
    {value: 'groupname', name: 'group name'},
    {value: 'phone_number', name: 'phone number'}
  ];
  resetPin = true;
  showSetPinButton = true;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1,
      org_id: this.organisationId
    };
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['reg_number'],

    });
    this.subRegionFilter = {
      location: {
        searchBy: 'cws',
        cws_id: this.organisationId
      },
      date: {
        from: this.seasonStartingTime,
        to: new Date()
      }
    };
    this.getFarmers(this.organisationId);
    this.getPaginatedFarmers();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
    });
    this.organisationService.getCwsSummary(this.organisationId).subscribe(data => {
      if (data.content.length) {
        this.cwsSummary = data.content[0];
      }
    });
    if (this.authenticationService.getCurrentUser().orgInfo.distributionSite) {
      this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe(data => {
        this.site = data.content;
      });
    }
    this.setMessage(this.messageService.getMessage());
    this.orgCoveredArea = this.route.snapshot.data.orgCoveredAreaData;
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.getAllFarmers();
    this.getSetPinStatus();
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.allFarmers, 'farmers');
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.organisationService.getFarmers(this.parameters)
      .subscribe(data => {
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
      this.parameters['search'.toString()] = this.filterForm.value;
      this.organisationService.getFarmers(this.parameters)
        .subscribe(data => {
          this.paginatedFarmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.loading = false;
        }, (err) => {
          this.loading = false;
          this.errors = err.errors;
        });
    }
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.organisationService.getFarmers(this.parameters)
      .subscribe(data => {
        this.paginatedFarmers = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      });
  }

  getFarmers(orgId: string): void {
    this.organisationService.getOrgFarmers(orgId).subscribe(data => {
      if (data) {
        this.farmers = data.content;
        this.farmers.map((farmer) => {
          farmer.request.requestInfo.map(land => {
            this.numberOfTrees = this.numberOfTrees + land.numberOfTrees;
          });
        });
      }
    });
  }

  getPaginatedFarmers(): void {
    this.loading = true;
    this.organisationService.getFarmers(this.parameters)
      .subscribe(data => {
        if (data.data.length === 0) {
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: 0
          };
          this.numberOfFarmers = 0;

        } else {
          this.paginatedFarmers = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
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
    const modalRef = this.modal.open(ParchmentReportDetailComponent, {size: 'lg'});
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
    this.organisationService.getAllFarmers(this.organisationId)
      .subscribe(data => {
        data.content.map((item) => {
          const temp = {
            NAMES: item.userInfo.surname + '  ' + item.userInfo.foreName,
            SEX: item.userInfo.sex,
            NID: item.userInfo.NID,
            PHONE: item.userInfo.phone_number,
            REGNUMBER: item.userInfo.regNumber,
            PROVINCE: item.request.requestInfo[0].location.prov_id.namek,
            DISTRICT: item.request.requestInfo[0].location.dist_id.name,
            SECTOR: item.request.requestInfo[0].location.sect_id.name,
            CELL: item.request.requestInfo[0].location.cell_id.name,
            VILLAGE: item.request.requestInfo[0].location.village_id.name,
            NUMBER_OF_TREES: this.getNumberOfTrees(item.request.requestInfo)
          };
          this.allFarmers.push(temp);
        });
        this.downloadingAll = false;
      });
  }

  getSetPinStatus() {
    this.showSetPinButton = false;
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
      this.resetPin = this.org.isPinResetAllowed;
      this.showSetPinButton = true;
    });
  }

  enableResetPin(status: boolean) {
    this.showSetPinButton = false;
    this.organisationService.allowSetPinOrgUsers({
      org_id: this.org._id,
      status
    }).subscribe(() => {
      this.getSetPinStatus();
    });
  }

  getNumberOfTrees = (requestInfo: any) => {
    let sum = 0;
    requestInfo.map((request) => {
      sum = sum + request.numberOfTrees;
    });
    return sum;
  }
}
