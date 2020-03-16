import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService, OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services';
import {ParchmentService} from '../../core/services';
import {AuthorisationService} from '../../core/services';
import {BasicComponent} from '../../core/library';
import {isUndefined} from 'util';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ParchmentReportDetailComponent} from './parchment-report-detail/parchment-report-detail.component';

@Component({
  selector: 'app-parchment-report',
  templateUrl: './parchment-report.component.html',
  styleUrls: ['./parchment-report.component.css']
})
export class ParchmentReportComponent extends BasicComponent implements OnInit {

  title = 'Cherries supply report';
  filterForm: FormGroup;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  loading = false;
  villages: any;
  distId = false;
  sectorId = false;
  showReport = false;
  graph1 = {
    type: 'ComboChart',
    data: [],
    columnNames: ['CWS', 'Cherries', 'Parchments', 'Expected Parchments'],
    options: {
      hAxis: {
        title: 'Coffee washing stations'
      },
      vAxis: {
        title: 'Parchments(kg)'
      },
      onclick: 'selectHandler',
      seriesType: 'bars',
      series: {
        0: {color: '#4b8214'},
        1: {color: '#367fa9'},
        2: {color: '#f0a732'}
      }
    },
    width: 1050,
    height: 450
  };

  total = 0;
  isCurrentUserDCC;

  constructor(private formBuilder: FormBuilder,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private modal: NgbModal,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private parchmentService: ParchmentService) {
    super();
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.filterForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
      }),
      date: this.formBuilder.group({
        from: [''],
        to: ['']
      })
    });
    this.initial();
    this.onChanges();
  }

  onSubmit(searchBy: string) {
    if (this.filterForm.valid) {
      this.loading = true;
      const filters = JSON.parse(JSON.stringify(this.filterForm.value));
      if (filters.location.prov_id === '' && searchBy === 'province') {
        delete filters.location;
        filters['location'.toString()] = {
          searchBy: 'all provinces'
        };
      } else {
        filters.location['searchBy'.toString()] = searchBy;
        this.helper.cleanObject(filters.location);
      }
      this.parchmentService.report(filters).subscribe((data) => {
        this.loading = false;
        this.total = 0;
        const reports = [];
        if (data.content.length !== 0) {
          data.content.forEach((item) => {
            const existing = reports.filter((value) => {
              return value[0] === item.regionName || value[0] === item.name;
            });
            if (existing.length) {
              const existingIndex = reports.indexOf(existing[0]);
              reports[existingIndex][1] = reports[existingIndex][1] + item.totalCherries;
              reports[existingIndex][3] = (reports[existingIndex][1] / 5);
            } else {
              reports.push([isUndefined(item.name)
                ? item.regionName : item.name, item.totalCherries, item.totalParchments, (item.totalCherries)]);
            }
          });
          this.graph1.data = reports;
          this.clear();
          this.showReport = true;
        } else {
          this.showReport = false;
          this.setMessage('Sorry no data found to this location!');
        }
      }, (err) => {
        if (err.status === 404) {
          this.showReport = false;
          this.setWarning(err.errors[0]);
        } else {
          this.setError(err.errors);
        }
      });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.filterForm));
    }
  }

  onChanges() {
    this.filterForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
        }
      }
    );
    this.filterForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
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
    this.filterForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
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
      });
  }

  selectHandler(event) {
    const modalRef = this.modal.open(ParchmentReportDetailComponent, {size: 'lg'});
    modalRef.componentInstance.location = event;
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
