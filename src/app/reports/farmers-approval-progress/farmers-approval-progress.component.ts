import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AuthenticationService,
  AuthorisationService, ExcelServicesService,
  FarmerService,
  LocationService,
  OrganisationService,
  OrganisationTypeService,
  SiteService
} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {isUndefined} from 'util';
import {BasicComponent} from '../../core/library';

@Component({
  selector: 'app-farmers-approval-progress',
  templateUrl: './farmers-approval-progress.component.html',
  styleUrls: ['./farmers-approval-progress.component.css']
})
export class FarmersApprovalProgressComponent extends BasicComponent implements OnInit {

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
  showData = false;
  zoneTotalApproved = 0;
  zoneTotalPending = 0;
  graph = {
    type: 'ColumnChart',
    data: [],
    options: {
      colors: ['#367fa9', '#f0a732']
    },
    columnNames: ['Farmers', 'approved', 'pending'],
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
              private excelService: ExcelServicesService,
              private authenticationService: AuthenticationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private siteService: SiteService) {
    super();
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.filterForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        zoneId: ['']
      }),
    });
    this.initial();
    this.onChanges();
  }

  onSubmit(searchBy: string) {
    if (this.filterForm.valid) {
      this.loading = true;
      this.subRegion = false;
      this.showReport = false;
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
          const reports = [];
          if (filters.location['searchBy'.toString()] === 'all provinces') {
            this.locationService.getProvinces().subscribe((provinces) => {
              provinces.map((prov) => {
                const tempApproved = data.content.farmers.find(obj => obj._id === prov._id);
                const tempPending = data.content.pending.filter(obj => obj._id === prov._id)[0];
                const temp = [prov.namek, 0, 0];
                if (!isUndefined(tempApproved)) {
                  temp[1] = tempApproved.totalConfirmed;
                }
                if (!isUndefined(tempPending)) {
                  temp[2] = tempPending.totalPending;
                }
                reports.push(temp);
              });
              this.loading = false;
              this.showReport = true;
              this.showData = false;
              this.graph.data = reports;
            });
          } else if (filters.location['searchBy'.toString()] === 'province') {
            this.locationService.getDistricts(filters.location.prov_id).subscribe((districts) => {
              districts.map((dist) => {
                const tempApproved = data.content.farmers.find(obj => obj._id === dist._id);
                const tempPending = data.content.pending.filter(obj => obj._id === dist._id)[0];
                const temp = [dist.name, 0, 0];
                if (!isUndefined(tempApproved)) {
                  temp[1] = tempApproved.totalConfirmed;
                }
                if (!isUndefined(tempPending)) {
                  temp[2] = tempPending.totalPending;
                }
                reports.push(temp);
              });
              this.loading = false;
              this.showReport = true;
              this.showData = false;
              this.graph.data = reports;
            });

          } else if (filters.location['searchBy'.toString()] === 'district') {
            data.content.map((zone) => {
              const temp = [zone.zone, zone.totalConfirmed, zone.totalPending];
              reports.push(temp);
            });
            this.loading = false;
            this.showReport = true;
            this.showData = false;
            this.graph.data = reports;
          } else {
            this.loading = false;
            this.showReport = false;
            this.showData = true;
            this.zoneTotalApproved = data.content.totalConfirmed;
            this.zoneTotalPending = data.content.totalPending;
          }
        },
        (err) => {
          if (err.status === 404) {
            this.showReport = false;
            this.setWarning(err.errors[0]);
          } else {
            this.clear();
            this.setError(err.errors);
          }
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  exportReport() {
    this.excelService.exportAsExcelFile(this.graph.data, 'report');
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
