import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService, ExcelServicesService, MessageService, OrganisationService, UserService} from '../../core/services';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {Farmer} from '../../core/models';
import {FarmerDetailsComponent} from '../../farmer/farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorisationService} from '../../core/services';
import {isArray, isObject} from 'util';
import {BasicComponent} from '../../core/library';
import {ParchmentReportDetailComponent} from '../../parchment/parchment-report/parchment-report-detail/parchment-report-detail.component';

@Component({
  selector: 'app-organisation-farmers',
  templateUrl: './organisation-farmers.component.html',
  styleUrls: ['./organisation-farmers.component.css']
})
export class OrganisationFarmersComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService, private userService: UserService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private route: ActivatedRoute,
              private messageService: MessageService,
              private modal: NgbModal, private authorisationService: AuthorisationService) {
    super();
  }

  farmers: any;
  organisationId: string;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  isUserCWSOfficer = true;
  org: any;
  numberOfTrees = 0;
  numberOfFarmers = 0;
  currentSeason: any;
  orgCoveredArea = [];
  allFarmers = [];
  cwsSummary = {
    totalCherries: 0,
    totalParchments: 0,
    expectedParchments: 0,
  };
  subRegionFilter: any;
  seasonStartingTime: string;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
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
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.getFarmers(this.organisationId);
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.organisationService.get(this.organisationId).subscribe(data => {
      this.org = data.content;
    });

    this.organisationService.getCwsSummary(this.organisationId).subscribe(data => {
      if (data.content.length) {
        this.cwsSummary = data.content[0];
      }
    });
    this.setMessage(this.messageService.getMessage());
    this.orgCoveredArea = this.route.snapshot.data.orgCoveredAreaData;
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.getAllFarmers();
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.allFarmers, 'farmers');
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getFarmers(orgId: string): void {
    this.loading = true;
    this.organisationService.getOrgFarmers(orgId).subscribe(data => {
      if (data) {
        this.farmers = data.content;
        this.farmers.map((farmer) => {
          farmer.request.requestInfo.map(land => {
            this.numberOfTrees = this.numberOfTrees + land.numberOfTrees;
          });
        });
        this.numberOfFarmers = this.farmers.length;
        this.dtTrigger.next();
        this.loading = false;
      }
    });
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

  showProduction() {
      const modalRef = this.modal.open(ParchmentReportDetailComponent, {size: 'lg'});
      modalRef.componentInstance.location = this.subRegionFilter;
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

  getAllFarmers() {
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
            VILLAGE: item.request.requestInfo[0].location.village_id.name
          };
          this.allFarmers.push(temp);
        });
      });
  }
}
