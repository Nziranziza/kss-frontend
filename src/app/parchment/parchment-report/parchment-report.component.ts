import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService, OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services/location.service';
import {ParchmentService} from '../../core/services/parchment.service';
import {AuthorisationService} from '../../core/services/authorisation.service';

@Component({
  selector: 'app-parchment-report',
  templateUrl: './parchment-report.component.html',
  styleUrls: ['./parchment-report.component.css']
})
export class ParchmentReportComponent implements OnInit {

  title = 'Parchment production report';
  filterForm: FormGroup;
  errors: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  loading = false;
  villages: any;
  distId = false;
  sectorId = false;
  cellId = false;
  showReport = false;
  reportData = [];
  message: string;
  graph = {
    type: 'ColumnChart',
    data: [],
    options: {
      colors: ['#367fa9']
    },
    columnNames: ['Location', 'Farmers'],
    width: 1050,
    height: 450
  };
  total = 0;
  isCurrentUserDCC;

  constructor(private formBuilder: FormBuilder,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private parchmentService: ParchmentService) {
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.filterForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
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
        if (data.content.length !== 0) {
          this.reportData = [];
          data.content.map((item) => {
            const temp = [item.name, item.totalParchments];
            this.total = this.total + item.totalParchments;
            this.reportData.push(temp);
          });
          this.graph.data = this.reportData;
          this.graph.options.colors = ['#367fa9'];
          this.graph.columnNames = ['Location', 'Parchments (Kg)'];

          this.showReport = true;
          this.message = '';
          this.errors = '';
        } else {
          this.showReport = false;
          this.message = 'Sorry no data found to this location!';
          this.errors = '';
          this.loading = false;
        }
      }, (err) => {
        if (err.status === 404) {
          this.showReport = false;
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
      }
    );
    this.filterForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
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
        this.filterForm.controls.location.get('prov_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.prov_id);
        this.filterForm.controls.location.get('dist_id'.toString())
          .patchValue(this.authenticationService.getCurrentUser().info.location.dist_id);
      }
    });
  }
}
