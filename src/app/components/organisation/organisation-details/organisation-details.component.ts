import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  BasicComponent,
  OrganisationService,
  UserService,
  AuthenticationService,
  ExcelServicesService,
  SiteService,
  LocationService,
  MessageService,
  HelperService,
  FarmerService,
  AuthorisationService,
} from "src/app/core";
import { Subject } from "rxjs";

@Component({
  selector: "app-organisation-details",
  templateUrl: "./organisation-details.component.html",
  styleUrls: ["./organisation-details.component.css"],
})
export class OrganisationDetailsComponent
  extends BasicComponent
  implements OnInit, OnDestroy
{
  cells: any;
  villages: any;
  farmers: any;
  config: { itemsPerPage: any; currentPage: any; totalItems: number; };
  paginatedFarmers: any;
  showData: boolean;
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

  organisationId: any;
  org: any;
  provinces: any;
  districts: any;
  filterForm: any;
  searchLocationBy: string;
  isUserCWSOfficer = true;
  sectors: any[];
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
  parameters: any;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.organisationId = params["organisationId".toString()];
    });
    this.parameters = {
      length: 10,
      start: 0,
      draw: 1,
      org_id: this.organisationId,
    };
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.organisationService.get(this.organisationId).subscribe((data) => {
      this.org = data.content;
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
    this.orgCoveredArea = this.route.snapshot.data.orgCoveredArea;
    this.currentSeason = this.authenticationService.getCurrentSeason();
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
  }
}
