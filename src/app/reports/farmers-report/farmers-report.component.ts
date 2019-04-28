import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LocationService} from '../../core/services/location.service';
import {Router} from '@angular/router';
import {FarmerService, OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';

@Component({
  selector: 'app-farmers-report',
  templateUrl: './farmers-report.component.html',
  styleUrls: ['./farmers-report.component.css']
})
export class FarmersReportComponent implements OnInit {

  title = 'Farmers registration report';
  filterForm: FormGroup;
  errors: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  byFarmers = true;
  distId = false;
  sectorId = false;
  cellId = false;
  graph = {
    type: 'ColumnChart',
    data: [
      ['South', 1000, 400],
      ['North', 1170, 460],
      ['West', 660, 1120],
      ['East', 1030, 540],
      ['Kigali', 500, 800]
    ],
    options: {
      colors: ['#e2431e', '#e7711b']
    },
    columnNames:  ['Location', 'Approved', 'Pending'],
    width: 1050,
    height: 450
  };

  options = [{name: 'Gender', value: 'gender'}];
  reportBy = [{name: 'Trees', value: 'trees'}, {name: 'Farmers', value: 'farmers'}];

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private farmerService: FarmerService) {
  }

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      reportBy: ['farmers'],
      option: ['status'],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
      })
    });
    this.initial();
    this.onChanges();
  }

  onSubmit(searchBy: string) {
    if (this.filterForm.valid) {
      const filters = this.filterForm.value;
      filters.location['searchBy'.toString()] = searchBy;
      this.farmerService.report(filters).subscribe((data) => {
        console.log(data);
      });

    } else {
      this.errors = this.helper.getFormValidationErrors(this.filterForm);
    }
  }

  onChanges() {
    this.filterForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null && value !== '') {
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
        if (value !== null) {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
          });
          this.distId = true;
        }
      }
    );
    this.filterForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
          this.sectorId = true;
        }
      }
    );
    this.filterForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== null) {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
          });
        }
        this.cellId = true;
      }
    );
    this.filterForm.get('reportBy'.toString()).valueChanges.subscribe(
      (value) => {
        if (value === 'farmers') {
          this.byFarmers = true;
        } else {
          this.byFarmers = false;
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
