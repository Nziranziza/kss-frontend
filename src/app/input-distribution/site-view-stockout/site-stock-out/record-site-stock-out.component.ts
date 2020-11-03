import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, AuthorisationService, LocationService, OrganisationService, SiteService} from '../../../core/services';
import {MessageService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {InputDistributionService} from '../../../core/services';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-record-site-stock-out',
  templateUrl: './record-site-stock-out.component.html',
  providers: [DatePipe],
  styleUrls: ['./record-site-stock-out.component.css']
})
export class RecordSiteStockOutComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() stock;
  siteStockOutForm: FormGroup;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  currentDate: any;
  site: any;
  org: any;
  isUserCWSOfficer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private authorisationService: AuthorisationService,
    private organisationService: OrganisationService,
    private messageService: MessageService,
    private locationService: LocationService,
    private datePipe: DatePipe,
    private siteService: SiteService,
    private helper: HelperService, private inputDistributionService: InputDistributionService) {
    super();

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  ngOnInit(): void {
    this.currentDate = new Date();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.siteStockOutForm = this.formBuilder.group({
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: ['']
      }),
      totalQty: ['', Validators.required],
      date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required],
    });
    if (this.isUserCWSOfficer) {
      this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
        this.org = data.content;
        this.filterCustomSectors(this.org);
      });
    } else {
      this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe((site) => {
        this.site = site.content;
        this.sectors = this.site.coveredAreas.coveredSectors;
      });
    }
    this.onChanges();
    this.initial();
  }

  onSubmit() {
    if (this.siteStockOutForm.valid) {
      const record = JSON.parse(JSON.stringify(this.siteStockOutForm.value));
      if (this.isUserCWSOfficer) {
        record.location['prov_id'.toString()] = this.org.location.prov_id._id;
        record.location['dist_id'.toString()] = this.org.location.dist_id._id;
      } else {
        record.location['prov_id'.toString()] = this.site.location.prov_id._id;
        record.location['dist_id'.toString()] = this.site.location.dist_id._id;
      }
      record.date = this.helper.getDate(this.siteStockOutForm.value.date);
      record['stockId'.toString()] = this.stock._id;
      record['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.helper.cleanObject(record.location);
      this.inputDistributionService.recordStockOut(record).subscribe(() => {
          this.messageService.setMessage('Stock out recorded!');
          this.siteStockOutForm.reset();
          this.siteStockOutForm.controls.date.
            setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2'));
          this.modal.dismiss();
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.siteStockOutForm));
    }
  }
  onChanges() {
    this.siteStockOutForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          if (this.isUserCWSOfficer) {
            this.filterCustomCells(this.org);
          } else {
            this.locationService.getCells(value).subscribe((data) => {
              this.cells = data;
              this.villages = null;
            });
          }
        }
      }
    );
    this.siteStockOutForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          if (this.isUserCWSOfficer) {
            this.filterCustomVillages(this.org);
          } else {
            this.locationService.getVillages(value).subscribe((data) => {
              this.villages = data;
            });
          }
        }
      }
    );
  }

  filterCustomSectors(org: any) {
    const temp = [];
    org.coveredSectors.map((sector) => {
      temp.push({
        sect_id: sector.sectorId,
        name: sector.name
      });
    });
    this.sectors = temp;
  }

  filterCustomCells(org: any) {
    const temp = [];
    const sectorId = this.siteStockOutForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    this.cells = temp;
  }

  filterCustomVillages(org: any) {
    const temp = [];
    const sectorId = this.siteStockOutForm.controls.location.get('sect_id'.toString()).value;
    const i = org.coveredSectors.findIndex(element => element.sectorId === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredVillages.map((village) => {
      temp.push({
        _id: village.village_id,
        name: village.name
      });
    });
    this.villages = temp;
  }

  initial() {
    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });
  }
}
