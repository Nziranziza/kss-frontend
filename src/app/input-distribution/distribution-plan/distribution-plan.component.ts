import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService, OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services';
import {InputDistributionService} from '../../core/services';
import {SiteService} from '../../core/services';
import {AuthorisationService} from '../../core/services';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-distribution-plan',
  templateUrl: './distribution-plan.component.html',
  styleUrls: ['./distribution-plan.component.css']
})
export class DistributionPlanComponent implements OnInit {

  title = 'Distribution plan';
  filterForm: FormGroup;
  checkProgressForm: FormGroup;
  errors: any;
  progressErrors: any;
  canCheckProgress: boolean;
  provinces: any;
  districts: any;
  loading = false;
  distId = false;
  zoneId = false;
  showPlan = false;
  message: string;
  totalFarmers = 0;
  totalTrees = 0;
  totalFertilizerNeeded = 0;
  totalNumberOfLands = 0;
  plans: any;
  organisations: any;
  subRegion: boolean;
  isCurrentUserDCC = false;
  distributionProgress: any;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  progressProvinces: any;
  progressDistricts: any;
  progressSectors: any;
  progressCells: any;
  progressVillages: any;
  progressDistId = false;
  progressSectorId = false;
  progressCellId = false;

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private inputDistributionService: InputDistributionService) {
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.filterForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: ['']
      }),
      zoneId: ['']
    });
    this.checkProgressForm = this.formBuilder.group({
      date: this.formBuilder.group({
        from: [''],
        to: ['']
      }),
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
    this.canCheckProgress = false;
    this.initial();
    this.onFilterProgress();
    this.onChanges();
  }

  onSubmit(searchBy: string) {
    if (this.filterForm.valid) {
      this.plans = [];
      this.loading = true;
      this.subRegion = false;
      const filters = JSON.parse(JSON.stringify(this.filterForm.value));
      if (filters.location.prov_id === '' && searchBy === 'province') {
        delete filters.location;
        filters['location'.toString()] = {
          searchBy: 'all provinces'
        };
        this.subRegion = true;
      } else {
        this.subRegion = !(searchBy === 'site' || searchBy === 'district');
        filters.location['searchBy'.toString()] = searchBy;
      }
      this.helper.cleanObject(filters.location);
      this.helper.cleanObject(filters);
      delete filters.date;
      this.inputDistributionService.report(filters, this.subRegion).subscribe((data) => {
        this.loading = false;
        this.totalFarmers = 0;
        this.totalFertilizerNeeded = 0;
        this.totalTrees = 0;
        this.totalNumberOfLands = 0;
        if ((data.content.length !== 0) && (data.content)) {
          data.content.map((item) => {
            const temp = {};
            this.totalFarmers = this.totalFarmers + item.uniqueFarmersCount;
            this.totalFertilizerNeeded = this.totalFertilizerNeeded + item.totalFertilizerNeeded;
            this.totalTrees = this.totalTrees + item.totalNumberOfTrees;
            this.totalNumberOfLands = this.totalNumberOfLands + item.totalNumberOfLands;
            if (filters.location.searchBy === 'all provinces') {
              temp['location'.toString()] = item.provName;
            }
            if (filters.location.searchBy === 'province') {
              temp['location'.toString()] = item.distName;
            }
            temp['numberOfTrees'.toString()] = item.totalNumberOfTrees;
            temp['numberOfFarmers'.toString()] = item.uniqueFarmersCount;
            temp['fertilizerNeed'.toString()] = item.totalFertilizerNeeded;
            temp['totalNumberOfLands'.toString()] = item.totalNumberOfLands;
            this.plans.push(temp);
          });
          this.showPlan = true;
          this.message = '';
          this.errors = '';
        } else {
          this.showPlan = false;
          this.message = 'Sorry no data found to this location!';
          this.errors = '';
          this.loading = false;
        }
      }, (err) => {
        if (err.status === 404) {
          this.showPlan = false;
          this.message = err.errors[0];
          this.errors = '';
          this.loading = false;
        } else {
          this.message = '';
          this.errors = err.errors;
        }
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.filterForm);
    }
  }

  onGetProgress(searchBy: string) {
    if (this.checkProgressForm.valid) {
      this.loading = true;
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
      this.inputDistributionService.getDistributionProgress(request).subscribe((data) => {
        this.loading = false;
        if ((data.content.length !== 0) && (data.content)) {
          this.message = '';
          this.progressErrors = '';
          this.distributionProgress = data.content;
          this.dtTrigger.next();
        } else {
          this.message = 'Sorry no data found to this location!';
          this.progressErrors = '';
          this.loading = false;
        }
      }, (err) => {
        if (err.status === 404) {
          this.message = err.errors[0];
          this.progressErrors = '';
          this.loading = false;
        } else {
          this.message = '';
          this.progressErrors = err.errors;
        }
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.checkProgressForm);
    }
  }

  onChanges() {
    this.filterForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          const body = {
            searchBy: 'province',
            prov_id: value
          };
          this.siteService.getZone(body).subscribe((data) => {
            this.organisations = data.content;
            this.zoneId = true;
          });
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
          });
        } else {
          this.zoneId = false;
        }
      }
    );
    this.filterForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.distId = true;
          const body = {
            searchBy: 'district',
            dist_id: value
          };
          this.siteService.getZone(body).subscribe((data) => {
            this.organisations = data.content;
            this.zoneId = true;
          });
        } else {
          this.distId = false;
        }
      }
    );
  }

  onFilterProgress() {
    this.checkProgressForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.progressDistricts = data;
            this.progressSectors = null;
            this.progressCells = null;
            this.progressVillages = null;
          });
        }
      }
    );
    this.checkProgressForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.progressSectors = data;
            this.progressCells = null;
            this.progressVillages = null;
            this.progressDistId = true;
          });
        } else {
          this.progressDistId = false;
        }
      }
    );
    this.checkProgressForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.progressCells = data;
            this.progressVillages = null;
            this.progressSectorId = true;
          });
        } else {
          this.progressSectorId = false;
        }
      }
    );
    this.checkProgressForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.progressVillages = data;
            this.progressCellId = true;
          });
        } else {
          this.progressCellId = false;
        }
      }
    );
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      this.progressProvinces = data;
      if (this.isCurrentUserDCC) {
        this.filterForm.controls.location.get('prov_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.prov_id);
        this.filterForm.controls.location.get('dist_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.dist_id);
      }
      if (this.isCurrentUserDCC) {
        this.checkProgressForm.controls.location.get('prov_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.prov_id);
        this.checkProgressForm.controls.location.get('dist_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.dist_id);
      }
    });
  }
}
