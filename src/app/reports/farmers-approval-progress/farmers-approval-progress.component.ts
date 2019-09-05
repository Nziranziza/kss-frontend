import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AuthenticationService,
  AuthorisationService,
  FarmerService,
  LocationService,
  OrganisationService,
  OrganisationTypeService, SiteService
} from '../../core/services';
import {HelperService} from '../../core/helpers';

@Component({
  selector: 'app-farmers-approval-progress',
  templateUrl: './farmers-approval-progress.component.html',
  styleUrls: ['./farmers-approval-progress.component.css']
})
export class FarmersApprovalProgressComponent implements OnInit {

  title = 'Farmers approval statistics';
  filterForm: FormGroup;
  errors: any;
  provinces: any;
  districts: any;
  loading = false;
  distId = false;
  zoneId = false;
  organisations: any;
  showReport = false;
  reportData = [];
  graph = {
    type: 'ColumnChart',
    data: [],
    options: {
      colors: ['#367fa9', '#f0a732']
    },
    columnNames: ['Farmers', 'approval', 'farmer'],
    width: 1050,
    height: 450
  };
  subRegion: boolean;
  message: string;
  isCurrentUserDCC = false;

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private authorisationService: AuthorisationService,
              private farmerService: FarmerService,
              private authenticationService: AuthenticationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private siteService: SiteService) {
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
    this.initial();
    this.onChanges();
  }

  onSubmit(searchBy: string) {
    if (this.filterForm.valid) {
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
        this.subRegion = !(searchBy === 'zone' || searchBy === 'district');
        filters.location['searchBy'.toString()] = searchBy;
      }
      this.helper.cleanObject(filters.location);
      this.helper.cleanObject(filters);
      this.farmerService.approvalStatistics(filters, this.subRegion).subscribe((data) => {
        this.loading = false;
        if (data.content.length !== 0) {
          this.reportData = [];
          this.graph.data = this.reportData;
          this.message = '';
          this.showReport = true;
        } else {
          this.showReport = false;
          this.message = 'Sorry no data found to this location !';
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
