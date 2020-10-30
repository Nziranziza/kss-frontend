import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Subject} from 'rxjs';

import {
  AuthenticationService,
  AuthorisationService, ExcelServicesService, InputDistributionService, LocationService,
  OrganisationService,
  OrganisationTypeService,
  SiteService
} from '../../../core/services';

import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-distribution-progress',
  templateUrl: './fertilizer-distribution-progress.component.html',
  styleUrls: ['./fertilizer-distribution-progress.component.css']
})
export class FertilizerDistributionProgressComponent extends BasicComponent implements OnInit {

  title = 'Fertilizer application progress';
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
  cellId = false;
  downloadSummaryEnabled = false;
  downloadDetailedEnabled = false;
  showData = false;
  request: any;
  site: any;
  printableDetails = [];
  downloading = false;
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
    this.reportIsReady = true;
    this.checkProgressForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
    });
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
        data.content.coveredSectors.map((sector) => {
          temp.push({
            _id: sector.sectorId,
            name: sector.name
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
    this.inputDistributionService.getDistributionProgressDetail(body).subscribe((data) => {
      this.printableDetails = data.content;
      this.excelService.exportAsExcelFile(this.printableDetails, 'Fe detailed application report');
      this.downloading = false;
      this.downloadDetailedEnabled = true;
    });
  }

  onGetProgress(searchBy: string) {
    if (this.checkProgressForm.valid) {
      this.loading = true;
      this.downloading = false;
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
      this.inputDistributionService.getDistributionProgress(request).subscribe((data) => {
        this.loading = false;
        this.distributionProgress = [];
        if ((data.content.length !== 0) && (data.content)) {
          this.clear();
          this.showData = true;
          data.content.map((location) => {
            const temp = {
              name: location.name,
              allocated: location.totalFertilizerAllocated ? location.totalFertilizerAllocated : 0,
              distributed: location.totalDistributed ? location.totalDistributed : 0,
              approved: location.totalApproved ? location.totalApproved : 0
            };
            this.distributionProgress.push(temp);
            const print = {
              location: location.name,
              totalFertilizerAllocated: location.totalFertilizerAllocated ? location.totalFertilizerAllocated : 0,
              distributed: location.totalDistributed ? location.totalDistributed : 0,
              approved: location.totalApproved ? location.totalApproved : 0
            };
            this.printable.push(print);
          });
        } else {
          this.setMessage('Sorry no data found to this location');
        }
      }, (err) => {
        if (err.status === 404) {
          this.setMessage('Sorry no data found to this location');
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
    this.checkProgressForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
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
    this.checkProgressForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
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
