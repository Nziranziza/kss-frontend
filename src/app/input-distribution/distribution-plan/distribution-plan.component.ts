import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services/location.service';
import {CherrySupplyService} from '../../core/services/cherry-supply.service';
import {InputDistributionService} from '../../core/services/input-distribution.service';
import {SiteService} from '../../core/services/site.service';

@Component({
  selector: 'app-distribution-plan',
  templateUrl: './distribution-plan.component.html',
  styleUrls: ['./distribution-plan.component.css']
})
export class DistributionPlanComponent implements OnInit {

  title = 'Distribution plan';
  filterForm: FormGroup;
  errors: any;
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
  plans: any;
  organisations: any;
  subRegion: boolean;

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private inputDistributionService: InputDistributionService) {
  }

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: ['']
      }),
      zoneId: ['']
    });
    this.initial();
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
        this.subRegion = true;
        if (searchBy === 'site' || searchBy === 'district') {
          this.subRegion = false;
        }
        filters.location['searchBy'.toString()] = searchBy;
      }
      this.helper.cleanObject(filters.location);
      this.helper.cleanObject(filters);
      this.inputDistributionService.report(filters, this.subRegion).subscribe((data) => {
        this.loading = false;
        this.totalFarmers = 0;
        this.totalFertilizerNeeded = 0;
        this.totalTrees = 0;
        if ((data.content.length !== 0) && (data.content)) {
          data.content.map((item) => {
            const temp = {};
            this.totalFarmers = this.totalFarmers + item.uniqueFarmersCount;
            this.totalFertilizerNeeded = this.totalFertilizerNeeded + item.totalFertilizerNeeded;
            this.totalTrees = this.totalTrees + item.totalNumberOfTrees;
            if (filters.location.searchBy === 'all provinces') {
              temp['location'.toString()] = item.provName;
            }
            if (filters.location.searchBy === 'province') {
              temp['location'.toString()] = item.distName;
            }
            temp['numberOfTrees'.toString()] = item.totalNumberOfTrees;
            temp['numberOfFarmers'.toString()] = item.uniqueFarmersCount;
            temp['fertilizerNeed'.toString()] = item.totalFertilizerNeeded;
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

  onChanges() {
    this.filterForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
          });
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

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }
}
