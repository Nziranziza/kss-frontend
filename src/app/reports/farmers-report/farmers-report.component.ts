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
      if (filters.location.prov_id === '' && searchBy === 'province') {
        delete filters.location;
        filters['location'.toString()] = {
          searchBy: 'all provinces'
        };
      } else {
        filters.location['searchBy'.toString()] = searchBy;
        this.helper.cleanObject(filters.location);
      }
      this.farmerService.report(filters).subscribe((data) => {
        if (data.content.length !== 0) {
          this.reportData = [];
          if (filters.reportBy === 'farmers') {
            data.content.map((item) => {
              const temp = [item.name, item.uniqueFarmersCount];
              this.reportData.push(temp);
            });
            this.graph.data = this.reportData;
            this.graph.options.colors = ['#367fa9'];
            this.graph.columnNames = ['Location', 'Farmers'];
          } else {
            data.content.map((item) => {
              const temp = [item.name, item.totalTrees];
              this.reportData.push(temp);
            });
            this.graph.data = this.reportData;
            this.graph.options.colors = ['#4b8214'];
            this.graph.columnNames = ['Location', 'Trees'];
          }
          this.showReport = true;
          this.message = '';
        } else {
          this.showReport = false;
          this.message = 'Sorry no data found to this location !';
        }
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.filterForm);
    }
  }

  onExport() {

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
