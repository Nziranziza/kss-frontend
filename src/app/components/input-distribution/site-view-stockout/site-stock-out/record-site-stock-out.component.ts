import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, AuthorisationService, LocationService, OrganisationService, SiteService} from '../../../../core';
import {MessageService} from '../../../../core';
import {HelperService} from '../../../../core';
import {InputDistributionService} from '../../../../core';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../../core';
import {ActivatedRoute} from '@angular/router';


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
  sectors: any = [];
  cells: any = [];
  villages: any = [];
  currentDate: any;
  site: any;
  @Input() siteId;
  @Input() totalStockOutFertilizer;
  @Input() totalqty;
  org: any;
  isCWSDistributor: any;
  public destinationList: FormArray;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private authorisationService: AuthorisationService,
    private organisationService: OrganisationService,
    private messageService: MessageService,
    private locationService: LocationService,
    private route: ActivatedRoute,
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
    this.isCWSDistributor = this.authorisationService.isCWSDistributer();
    this.siteStockOutForm = this.formBuilder.group({
      destination: new FormArray([]),
      totalQty: ['', [Validators.required, Validators.max(this.totalqty - this.totalStockOutFertilizer)]],
      date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required],
    });
    if (this.isCWSDistributor) {
      this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
        this.org = data.content;
        this.siteService.get(this.siteId).subscribe((site) => {
          this.site = site.content;
          this.addDestination();
          this.filterCustomSectors(this.org, 0);
        });
      });

    } else {
     /* this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSites).subscribe((site) => {
        this.site = site.content;
        this.addDestination();
        this.filterCustomSectors(this.site, 0);
      });*/
    }
    this.initial();
  }

  getField(fieldName: string) {
    return this.siteStockOutForm.get(fieldName);
  }

  onSubmit() {
    if (this.siteStockOutForm.valid) {
      const record = JSON.parse(JSON.stringify(this.siteStockOutForm.value));
      if (this.isCWSDistributor) {
        record.destination.map((destination) => {
          destination['prov_id'.toString()] = this.org.location.prov_id._id;
          destination['dist_id'.toString()] = this.org.location.dist_id._id;
        });
      } else {
        record.destination.map((destination) => {
          destination['prov_id'.toString()] = this.site.location.prov_id._id;
          destination['dist_id'.toString()] = this.site.location.dist_id._id;
        });
      }
      record.date = this.helper.getDate(this.siteStockOutForm.value.date);
      record.siteId = this.stock.siteId._id;
      record['stockId'.toString()] = this.stock._id;
      record['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.helper.cleanObject(record.location);
      this.inputDistributionService.recordStockOut(record).subscribe(() => {
          this.messageService.setMessage('Stock out recorded!');
          this.siteStockOutForm.reset();
          this.siteStockOutForm.controls.date.setValue(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd', 'GMT+2'));
          this.modal.dismiss();
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.siteStockOutForm));
    }
  }

  createDestination(): FormGroup {
    return this.formBuilder.group({
      sect_id: ['', Validators.required],
      cell_id: ['', Validators.required],
      village_id: ['', Validators.required]
    });
  }

  get formDestination() {
    return this.siteStockOutForm.get('destination') as FormArray;
  }

  addDestination() {
    (this.siteStockOutForm.controls.destination as FormArray).push(this.createDestination());
    this.sectors.push(this.sectors[0]);
  }

  removeDestination(index: number) {
    if ((this.siteStockOutForm.controls.destination as FormArray).length > 1) {
      (this.siteStockOutForm.controls.destination as FormArray).removeAt(index);
    }
  }

  getDestinationFormGroup(index): FormGroup {
    this.destinationList = this.siteStockOutForm.get('destination') as FormArray;
    return this.destinationList.controls[index] as FormGroup;
  }

  onChangeSector(index: number) {
    const value = this.getDestinationFormGroup(index).controls.sect_id.value;
    if (value !== '') {
      if (this.isCWSDistributor) {
        this.filterCustomCells(this.org, index);
      } else {
        this.locationService.getCells(value).toPromise().then(data => {
          this.cells[index] = data;
          this.villages[index] = [];
        });
      }
    }
  }

  onChangeCell(index: number) {
    const value = this.getDestinationFormGroup(index).controls.cell_id.value;
    if (value !== '') {
      if (this.isCWSDistributor) {
        this.locationService.getVillages(value).toPromise().then(data => {
          const sectorId = this.getDestinationFormGroup(index).controls.sect_id.value;
          const i = this.org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
          const sector = this.org.coveredSectors[i];
          this.villages[index] = [];
          data.map((village) => {
            if (sector.coveredVillages.findIndex((vil) => village._id === vil.village_id) >= 0) {
              this.villages[index].push(village);
            }
          });
        });
      } else {
        this.locationService.getVillages(value).toPromise().then(data => {
          this.villages[index] = data;
        });
      }
    }
  }

  filterCustomSectors(org: any, index: number) {
    const temp = [];
    org.coveredSectors.map((sector) => {
      if (this.isCWSDistributor) {
        const position = this.site.coveredAreas.coveredSectors.findIndex(elem => elem.sect_id === sector.sectorId._id);
        if (position > -1) {
          temp.push({
            _id: sector.sectorId._id,
            name: sector.sectorId.name
          });
        }
      } else {
        temp.push({
          _id: sector.sectorId._id,
          name: sector.sectorId.name
        });
      }
    });
    this.sectors[index] = temp;
  }

  filterCustomCells(org: any, index: number) {
    const temp = [];
    const sectorId = this.getDestinationFormGroup(index).controls.sect_id.value;
    const i = org.coveredSectors.findIndex(element => element.sectorId._id === sectorId);
    const sector = org.coveredSectors[i];
    sector.coveredCells.map((cell) => {
      temp.push({
        _id: cell.cell_id,
        name: cell.name
      });
    });
    this.cells[index] = temp;
  }


  initial() {
  }
}
