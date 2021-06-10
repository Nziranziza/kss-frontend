import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService, ExcelServicesService, OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services';
import {ParchmentService} from '../../core/services';
import {AuthorisationService} from '../../core/services';
import {BasicComponent} from '../../core/library';
import {isUndefined} from 'util';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ParchmentReportDetailComponent} from './parchment-report-detail/parchment-report-detail.component';
import {DatePipe} from '@angular/common';
import {Subject} from 'rxjs';

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
  showDistrictAllCWS = false;
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
    width: 1250,
    height: 550
  };

  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  seasonStartingTime: string;
  currentDate: string;

  total = {
    cherriesQty: 0,
    parchmentsQty: 0,
    expectedParchmentsQty: 0
  };

  isCurrentUserDCC;
  subRegionFilter: any;
  regionIds = [];

  constructor(private formBuilder: FormBuilder,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private excelService: ExcelServicesService,
              private modal: NgbModal,
              private datePipe: DatePipe,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService, private parchmentService: ParchmentService) {
    super();
  }

  ngOnInit() {
    this.isCurrentUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    this.seasonStartingTime = this.authenticationService.getCurrentSeason().created_at;
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.filterForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
      }),
      date: this.formBuilder.group({
        from: [this.datePipe.transform(this.seasonStartingTime,
          'yyyy-MM-dd', 'GMT+2')],
        to: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2')],
      })
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this.initial();
    this.onChanges();
  }

  onSubmit(searchBy: string) {
    this.loading = true;
    this.total = {
      cherriesQty: 0,
      parchmentsQty: 0,
      expectedParchmentsQty: 0
    };
    const filters = JSON.parse(JSON.stringify(this.filterForm.value));
    if ((filters.location.prov_id === 'all provinces' ||
      filters.location.prov_id === 'all districts' || filters.location.prov_id === 'all cws') && searchBy === 'province') {
      filters['location'.toString()] = {
        searchBy: filters.location.prov_id
      };
    } else if (filters.location.dist_id === 'all cws' && searchBy === 'district') {
      filters.location['searchBy'.toString()] = 'all cws';
      delete filters.location.dist_id;
      this.helper.cleanObject(filters.location);
    } else {
      if (searchBy === 'province') {
        delete filters.location.dist_id;
        delete filters.location.sect_id;
      }
      if (searchBy === 'district') {
        delete filters.location.prov_id;
        delete filters.location.sect_id;
      }
      if (searchBy === 'sector') {
        delete filters.location.dist_id;
        delete filters.location.prov_id;
      }
      filters.location['searchBy'.toString()] = searchBy;
      this.helper.cleanObject(filters.location);
    }
    this.subRegionFilter = JSON.parse(JSON.stringify(filters));
    this.setSubRegionFilter(this.subRegionFilter);

    this.parchmentService.report(filters).subscribe((data) => {
      this.loading = false;
      const reports = [];
      this.regionIds = [];
      if (data.content.length !== 0) {
        data.content.forEach((item) => {
          const existing = reports.filter((value) => {
            return value[0] === item.regionName || value[0] === item.name;
          });
          if (existing.length) {
            const existingIndex = reports.indexOf(existing[0]);
            reports[existingIndex][1] = reports[existingIndex][1] + item.totalCherries;
            reports[existingIndex][3] = (reports[existingIndex][1] / 5);
            this.total.cherriesQty = this.total.cherriesQty + (isUndefined(item.totalCherries) ? 0 : item.totalCherries);
            this.total.expectedParchmentsQty = this.total.expectedParchmentsQty + (item.totalCherries / 5);
          } else {
            if (item.regionId) {
              this.regionIds.push(item.regionId);
            }
            if (item.cwsId) {
              this.regionIds.push(item.cwsId);
            }
            reports.push([isUndefined(item.name)
              ? item.regionName : item.name, isUndefined(item.totalCherries) ? 0 : item.totalCherries,
              isUndefined(item.totalParchments) ? 0 : item.totalParchments,
              (isUndefined(item.totalCherries) ? 0 : item.totalCherries / 5)]);
            this.total.cherriesQty = this.total.cherriesQty + (isUndefined(item.totalCherries) ? 0 : item.totalCherries);
            this.total.parchmentsQty = this.total.parchmentsQty + (isUndefined(item.totalParchments) ? 0 : item.totalParchments);
            this.total.expectedParchmentsQty = this.total.expectedParchmentsQty + (item.totalCherries / 5);
          }
        });
        this.graph1.data = reports;
        this.clear();
        this.showReport = true;
      } else {
        this.showReport = false;
        this.setWarning('Sorry no data found to this location!');
      }
    }, (err) => {
      if (err.status === 404) {
        this.showReport = false;
        this.setWarning(err.errors[0]);
      } else {
        this.setError(err.errors);
      }
    });
  }

  onChanges() {
    this.filterForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== 'all provinces' && value !== 'all cws' && value !== 'all districts') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
          this.showDistrictAllCWS = true;
        } else {
          this.distId = false;
          this.districts = null;
          this.sectors = null;
          this.cells = null;
          this.villages = null;
          this.showDistrictAllCWS = false;
        }
      }
    );
    this.filterForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '' && value !== 'all cws') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
            this.distId = true;
          });
        } else { this.distId = value === 'all cws'; }
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
    if (event[0]) {
      this.updateSubRegionFilter(this.regionIds[event[0].row]);
      const modalRef = this.modal.open(ParchmentReportDetailComponent, {size: 'lg'});
      modalRef.componentInstance.location = this.subRegionFilter;
    }
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

  setSubRegionFilter(filter: any) {
    switch (filter.location.searchBy) {
      case 'all provinces': {
        this.subRegionFilter.location = {
          searchBy: 'province',
          prov_id: null,
        };
        break;
      }

      case 'province': {
        this.subRegionFilter.location = {
          searchBy: 'district',
          dist_id: null,
        };
        break;
      }

      case 'district': {
        this.subRegionFilter.location = {
          searchBy: 'cws',
          cws_id: null,
        };
        break;
      }

      case 'sector': {
        this.subRegionFilter.location = {
          searchBy: 'cws',
          cws_id: null,
        };
        break;
      }
    }
  }

  exportReport() {
    const report = [];
    this.graph1.data.forEach((item) => {
      const temp = {
        location: item[0],
        cherries: item[1],
        parchments: item [2],
        expected_parchments: item[3]
      };
      report.push(temp);
    });
    this.excelService.exportAsExcelFile(report, 'production report');
  }


  updateSubRegionFilter(id: string) {
    switch (this.subRegionFilter.location.searchBy) {
      case 'province': {
        this.subRegionFilter.location.prov_id = id;
        break;
      }

      case 'district': {
        this.subRegionFilter.location.dist_id = id;
        break;
      }

      case 'cws': {
        this.subRegionFilter.location.cws_id = id;
        break;
      }
    }
  }
}
