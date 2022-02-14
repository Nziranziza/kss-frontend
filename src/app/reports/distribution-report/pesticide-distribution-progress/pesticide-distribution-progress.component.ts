import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';
import {
  AuthenticationService,
  AuthorisationService,
  ExcelServicesService, InputDistributionService, LocationService,
  OrganisationService,
  OrganisationTypeService,
  SiteService
} from '../../../core/services';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-pesticide-distribution-progress',
  templateUrl: './pesticide-distribution-progress.component.html',
  styleUrls: ['./pesticide-distribution-progress.component.css']
})
export class PesticideDistributionProgressComponent extends BasicComponent implements OnInit {

  title = 'Pesticide application progress';
  checkProgressForm: FormGroup;
  errors: any;
  loading = false;
  message: string;
  isCurrentUserDCC = false;
  isSiteManager = false;
  isCWSUser = false;
  distributionProgress: any;
  printable = [];
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  distId = false;
  sectorId = false;
  org: any;
  cellId = false;
  downloadSummaryEnabled = false;
  downloadDetailedEnabled = false;
  showData = false;
  request: any;
  site: any;
  downloading = false;
  private printableDetails = [];
  reportIsReady: boolean;

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private inputDistributionService: InputDistributionService) {
    super();
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.isSiteManager = this.authorisationService.isSiteManager();
    this.isCWSUser = this.authorisationService.isCWSUser();
    this.checkProgressForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
    });
    this.reportIsReady = true;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    if (this.isSiteManager) {
      this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe((site) => {
        this.site = site.content;
        const temp = [];
        this.site.coveredAreas.coveredSectors.map((sector) => {
          temp.push(
            {
              _id: sector.sect_id,
              name: sector.name
            }
          );
        });
        this.sectors = temp;
      });
    } else if (this.isCWSUser) {
      this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
        const temp = [];
        this.org = data.content;
        data.content.coveredSectors.map((sector) => {
          temp.push({
            _id: sector.sectorId._id,
            name: sector.sectorId.name
          });
        });
        this.sectors = temp;
      });
    }
    this.initial();
    this.onFilterProgress();
  }

  exportAsXLSX() {
    this.excelService.exportAsExcelFile(this.printable, 'application report');
  }

  onGetProgress(searchBy: string) {
    if (this.checkProgressForm.valid) {
      this.downloading = false;
      this.loading = true;
      this.printable = [];
      this.downloadSummaryEnabled = true;
      const request = JSON.parse(JSON.stringify(this.checkProgressForm.value));
      if (request.location.prov_id === '' && searchBy === 'province') {
        delete request.location;
        request['location'.toString()] = {
          searchBy: 'all provinces'
        };
      } else {
        request.location['searchBy'.toString()] = searchBy;
        this.helper.cleanObject(request.location);
      }
      this.downloadDetailedEnabled = searchBy !== 'province';
      this.request = request;
      this.inputDistributionService.getDistributionProgressPesticide(request).subscribe((data) => {
        this.loading = false;
        this.distributionProgress = [];
        if ((data.content.length !== 0) && (data.content)) {
          this.clear();
          this.distributionProgress = data.content;
          this.distributionProgress.map((location) => {
            const print = {
              location: location.name,
              totalNumberOfLands: location.totalNumberOfLands ? location.totalNumberOfLands : 0,
              totalNumberOfTrees: location.totalNumberOfTrees ? location.totalNumberOfTrees : 0,
              totalApplied: location.totalApplied ? location.totalApplied : 0,
              totalApproved: location.totalApproved ? location.totalApproved : 0
            };
            this.printable.push(print);
          });
          this.showData = true;
        } else {
          this.setMessage('Sorry no data found to this location!');
        }
      }, (err) => {
        if (err.status === 404) {
          this.setMessage('Sorry no data found to this location!');
        } else {
          this.setError(err.errors);
        }
      });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.checkProgressForm));
    }
  }

  onFilterProgress() {
    this.checkProgressForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
          this.downloadDetailedEnabled = false;
        }
      }
    );
    this.checkProgressForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          if (this.isCWSUser) {
            this.filterCustomSectors(this.org);
          } else {
            this.locationService.getSectors(value).subscribe((data) => {
              this.sectors = data;
              this.cells = null;
              this.villages = null;
            });
          }
          this.distId = true;
        } else {
          this.distId = false;
        }
      }
    );
    this.checkProgressForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          if (this.isCWSUser) {
            this.filterCustomCells(this.org);
          } else {
            this.locationService.getCells(value).subscribe((data) => {
              this.cells = data;
              this.villages = null;
            });
          }
          this.sectorId = true;
        } else {
          this.sectorId = false;
        }
      }
    );
    this.checkProgressForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {

          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
          });

          this.cellId = true;
        } else {
          this.cellId = false;
        }
      }
    );
  }

  filterCustomSectors(org: any) {
    const temp = [];
    org.coveredSectors.map((sector) => {
      temp.push({
        _id: sector.sectorId._id,
        name: sector.sectorId.name
      });
    });
    this.sectors = temp;
  }

  filterCustomCells(org: any) {
    const temp = [];
    const sectorId = this.checkProgressForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    this.cells = temp;
  }

  downloadDetails() {
    this.downloading = true;
    this.downloadDetailedEnabled = false;
    const body = {
      location: {}
    };
    if (this.request.location.searchBy === 'district') {
      body.location['searchBy'.toString()] = 'district';
      body.location['dist_id'.toString()] = this.request.location.dist_id;
    }

    if (this.request.location.searchBy === 'sector') {
      body.location['searchBy'.toString()] = 'sector';
      body.location['sect_id'.toString()] = this.request.location.sect_id;
    }

    if (this.request.location.searchBy === 'cell') {
      body.location['searchBy'.toString()] = 'cell';
      body.location['cell_id'.toString()] = this.request.location.cell_id;
    }
    this.inputDistributionService.getDistributionProgressPesticideDetail(body).subscribe((data) => {
      this.printableDetails = data.content;
      this.excelService.exportAsExcelFile(this.printableDetails, 'Pe detailed application report');
      this.downloading = false;
      this.downloadDetailedEnabled = true;
    });
  }

  summarizeData(field: string){
    let sum = 0;
    for(let i = 0; i < this.distributionProgress.length; i++) {
      console.log(this.distributionProgress[i][field])
      sum += this.distributionProgress[i][field];
    }
    return sum;
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      if (this.isCurrentUserDCC) {
        this.checkProgressForm.controls.location.get('prov_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.prov_id);
        this.checkProgressForm.controls.location.get('dist_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.dist_id);
      }
    });
  }
}
