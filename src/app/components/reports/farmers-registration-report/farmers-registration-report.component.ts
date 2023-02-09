import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {ExcelServicesService, LocationService} from '../../../core';
import {Router} from '@angular/router';
import {AuthenticationService, FarmerService, OrganisationService, OrganisationTypeService} from '../../../core';
import {HelperService} from '../../../core';
import { ChartType } from 'angular-google-charts';



import {AuthorisationService} from '../../../core';

@Component({
  selector: 'app-farmers-registration-report',
  templateUrl: './farmers-registration-report.component.html',
  styleUrls: ['./farmers-registration-report.component.css']
})
export class FarmersRegistrationReportComponent implements OnInit {

  title = 'Farmers registration report';
  filterForm: UntypedFormGroup;
  errors: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  loading = false;
  villages: any;
  byFarmers = true;
  distId = false;
  sectorId = false;
  cellId = false;
  showReport = false;
  reportData = [];
  message: string;
  graph = {
    type: ChartType.ColumnChart,
    data: [],
    options: {
      colors: ['#367fa9'],
      onclick: 'selectHandler'
    },
    columnNames: ['Location', 'Farmers'],
    width: 1050,
    height: 450
  };

  options = [{name: 'Gender', value: 'gender'}];
  reportBy = [{name: 'Trees', value: 'trees'}, {name: 'Farmers', value: 'farmers'}];
  total = 0;
  isCurrentUserDCC = false;

  constructor(private formBuilder: UntypedFormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private farmerService: FarmerService) {
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
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
      this.farmerService.report(filters).subscribe((data) => {
        this.loading = false;
        this.total = 0;
        if (data.content.length !== 0) {
          this.reportData = [];
          if (filters.reportBy === 'farmers') {
            data.content.map((item) => {
              const temp = [item.name, item.uniqueFarmersCount];
              this.total = this.total + item.uniqueFarmersCount;
              this.reportData.push(temp);
            });
            this.graph.data = this.reportData;
            this.graph.options.colors = ['#367fa9'];
            this.graph.columnNames = ['Location', 'Farmers'];
          } else {
            data.content.map((item) => {
              const temp = [item.name, item.totalTrees];
              this.total = this.total + item.totalTrees;
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
        this.byFarmers = value === 'farmers';
      }
    );
  }

  selectHandler(event) {
  }

  exportReport() {
    this.excelService.exportAsExcelFile(this.reportData, 'report');
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
