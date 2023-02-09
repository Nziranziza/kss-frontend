import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  AuthenticationService,
  AuthorisationService,
  ExcelServicesService,
  InputDistributionService,
  LocationService,
  OrganisationService,
  OrganisationTypeService,
  SiteService,
} from '../../../../core';
import { Router } from '@angular/router';
import { HelperService } from '../../../../core';
import { isUndefined } from 'util';
import { BasicComponent } from '../../../../core';
import { ChartType } from 'angular-google-charts';

@Component({
  selector: 'app-dispatch-progress',
  templateUrl: './dispatch-progress.component.html',
  styleUrls: ['./dispatch-progress.component.css'],
})
export class DispatchProgressComponent
  extends BasicComponent
  implements OnInit {
  title = 'Distribution progress';
  checkProgressForm: UntypedFormGroup;
  errors: any;
  loading = false;
  message: string;
  isCurrentUserDCC = false;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  provinces: any;
  districts: any;
  sites: any;
  distId = false;
  siteId = false;
  showReport = false;
  showData = false;
  printable = [];
  siteTotalAllocated = 0;
  siteTotalDispatched = 0;
  graph = {
    type: ChartType.ColumnChart,
    data: [],
    options: {
      colors: ['#367fa9', '#f0a732'],
    },
    columnNames: ['Farmers', 'allocated', 'dispatched'],
    width: 1050,
    height: 450,
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private siteService: SiteService,
    private authorisationService: AuthorisationService,
    private authenticationService: AuthenticationService,
    private excelService: ExcelServicesService,
    private router: Router,
    private organisationService: OrganisationService,
    private helper: HelperService,
    private organisationTypeService: OrganisationTypeService,
    private locationService: LocationService,
    private inputDistributionService: InputDistributionService
  ) {
    super();
  }

  ngOnInit() {
    this.isCurrentUserDCC =
      this.authorisationService.isDistrictCashCropOfficer();
    this.checkProgressForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        siteId: [],
      }),
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
    };
    this.initial();
    this.onFilterProgress();
  }

  onGetProgress(searchBy: string) {
    if (this.checkProgressForm.valid) {
      this.loading = true;
      this.showReport = false;
      const request = JSON.parse(JSON.stringify(this.checkProgressForm.value));

      if (request.location.prov_id === '' && searchBy === 'province') {
        delete request.location;
        request['location'.toString()] = {
          searchBy: 'all provinces',
        };
      } else {
        request.location['searchBy'.toString()] = searchBy;
        this.helper.cleanObject(request.location);
      }
      if (searchBy !== 'site') {
        delete request.siteId;
      }
      this.inputDistributionService.getDispatchProgress(request).subscribe(
        (data) => {
          if (data.content.length !== 0 && data.content) {
            const reports = [];
            if (request.location['searchBy'.toString()] === 'all provinces') {
              data.content.map((prov) => {
                const temp = [prov.name, 0, 0];
                if (!isUndefined(location)) {
                  temp[1] = prov.totalFertilizerAllocated
                    ? prov.totalFertilizerAllocated
                    : 0;
                  temp[2] = prov.totalDispatched ? prov.totalDispatched : 0;
                }
                reports.push(temp);
              });
              this.loading = false;
              this.showReport = true;
              this.showData = false;
              this.graph.data = reports;
            } else if (request.location['searchBy'.toString()] === 'province') {
              this.locationService
                .getDistricts(request.location.prov_id)
                .subscribe((districts) => {
                  districts.map((dist) => {
                    const location = data.content.find(
                      (obj) => obj._id === dist._id
                    );
                    const temp = [dist.name, 0, 0];
                    if (!isUndefined(location)) {
                      temp[1] = location.totalFertilizerAllocated
                        ? location.totalFertilizerAllocated
                        : 0;
                      temp[2] = location.totalDispatched
                        ? location.totalDispatched
                        : 0;
                    }
                    reports.push(temp);
                  });
                  this.loading = false;
                  this.showReport = true;
                  this.showData = false;
                  this.graph.data = reports;
                });
            } else if (request.location['searchBy'.toString()] === 'district') {
              data.content.map((site) => {
                const temp = [site.name, 0, 0];
                if (!isUndefined(location)) {
                  temp[1] = site.totalFertilizerAllocated
                    ? site.totalFertilizerAllocated
                    : 0;
                  temp[2] = site.totalDispatched ? site.totalDispatched : 0;
                }
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
              this.siteTotalDispatched = data.content.dispatched;
              this.siteTotalAllocated = data.content.totalFertilizerAllocated;
            }
            this.clear();
            this.printable = reports;
          } else {
            this.setMessage('Sorry no data found for this location');
            this.loading = false;
          }
        },
        (err) => {
          if (err.status === 404) {
            this.showReport = false;
            this.setMessage(err.errors[0]);
            this.loading = false;
          } else {
            this.setError(err.errors);
          }
        }
      );
    } else {
      this.setError(
        this.helper.getFormValidationErrors(this.checkProgressForm)
      );
    }
  }

  onFilterProgress() {
    this.checkProgressForm.controls.location
      .get('prov_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
          });
        }
      });
    this.checkProgressForm.controls.location
      .get('dist_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          const body = {
            searchBy: 'district',
            dist_id: value,
          };
          this.siteService.all(body).subscribe((data) => {
            this.sites = data.content;
            this.distId = true;
          });
        } else {
          this.distId = false;
        }
      });
    this.checkProgressForm.controls.location
      .get('siteId')
      .valueChanges.subscribe((value) => {
        this.siteId = value !== '';
      });
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
      if (this.isCurrentUserDCC) {
        this.checkProgressForm.controls.location
          .get('prov_id'.toString())
          .patchValue(
            this.authenticationService.getCurrentUser().info.location.prov_id
          );
        this.checkProgressForm.controls.location
          .get('dist_id'.toString())
          .patchValue(
            this.authenticationService.getCurrentUser().info.location.dist_id
          );
      }
    });
  }
  exportReport() {
    this.excelService.exportAsExcelFile(this.printable, 'report');
  }

  async detailedReport() {
    this.loading = true;
    const status = await this.excelService.exportDetailedExcel();
    if (!status) {
      this.errors(['Error Exporting File']);
    }

    this.loading = !status;
  }

  siteExport() {
    this.inputDistributionService.siteExport().subscribe((data) => {
      const byteArray = new Uint8Array(atob(data.data).split('').map(char => char.charCodeAt(0)));
      const newBlob = new Blob([byteArray], {type: 'application/pdf'});
      const linkElement = document.createElement('a');
      const url = URL.createObjectURL(newBlob);
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', data.fileName + '.pdf');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      linkElement.dispatchEvent(clickEvent);
    });
  }

  distributionExport() {
    this.inputDistributionService.distributionExport().subscribe((data) => {
      const byteArray = new Uint8Array(atob(data.data).split('').map(char => char.charCodeAt(0)));
      const newBlob = new Blob([byteArray], {type: 'application/pdf'});
      const linkElement = document.createElement('a');
      const url = URL.createObjectURL(newBlob);
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', data.fileName + '.pdf');
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      linkElement.dispatchEvent(clickEvent);
    });
  }
}
