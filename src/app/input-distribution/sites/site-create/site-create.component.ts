import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {MessageService, SiteService} from '../../../core/services';
import {OrganisationService} from '../../../core/services';
import {LocationService} from '../../../core/services';

@Component({
  selector: 'app-site-create',
  templateUrl: './site-create.component.html',
  styleUrls: ['./site-create.component.css']
})
export class SiteCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private siteService: SiteService,
              private locationService: LocationService,
              private messageService: MessageService,
              private helper: HelperService, private organisationService: OrganisationService) {
  }

  createForm: FormGroup;
  errors: string[];
  organisations: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  totalAllocatedQty = 0;
  selectedCoveredSectors = [];
  selectedCoveredCWS = [];
  coveredSectorsSet = [];
  coveredCWSSet = [];

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      siteName: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      allocatedQty: [this.totalAllocatedQty],
      coveredAreas: this.formBuilder.group({
        coveredSectors: [[]],
        coveredCWS: [[]],
      })
    });
    this.organisationService.all().subscribe((data) => {
      this.organisations = data.content;
    });
    this.initial();
    this.onChanges();
  }

  onSubmit() {
    if (this.createForm.valid) {
      const val = this.createForm.value;
      const site = JSON.parse(JSON.stringify(val));
      this.helper.cleanObject(site);
      const tempSectors = [];
      const tempCWS = [];
      site.coveredAreas.coveredSectors.map((id) => {
        const sector = this.coveredSectorsSet.find(obj => obj._id === id);
        if (sector) {
          tempSectors.push({
            sect_id: id,
            name: sector.name
          });
        }
        site.coveredAreas.coveredSectors = tempSectors;
      });
      site.coveredAreas.coveredCWS.map((id) => {
        const cws = this.coveredCWSSet.find(obj => obj._id === id);
        if (cws) {
          tempCWS.push({
            org_id: id,
            name: cws.organizationName
          });
        }
        site.coveredAreas.coveredCWS = tempCWS;
      });
      if (site.coveredAreas.coveredCWS.length === 0) {
        delete site.coveredAreas.coveredCWS;
      }
      this.helper.cleanObject(site.location);
      this.siteService.save(site).subscribe(() => {
          this.messageService.setMessage('Site successfully created!');
          this.router.navigateByUrl('admin/sites');
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

  public onMouseDownCWS(event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'.toString()] = !event.target['selected'.toString()];
    if (event.target['selected'.toString()]) {
      this.createForm.controls.coveredAreas.get('coveredCWS'.toString()).value.push(item._id);
      this.selectedCoveredCWS.push(item.organizationName);
    } else {
      let i: number;
      i = this.createForm.value.coveredAreas.coveredCWS.indexOf(item._id);
      if (i > -1) {
        this.createForm.controls.coveredAreas.get('coveredCWS'.toString()).value.splice(i, 1);
        this.selectedCoveredCWS.splice(i, 1);
      }
    }
  }

  public onMouseDownSector(event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'.toString()] = !event.target['selected'.toString()];
    if (event.target['selected'.toString()]) {
      this.createForm.controls.coveredAreas.get('coveredSectors'.toString()).value.push(item._id);
      this.siteService.getSectorAllocatedFertilizer(item._id).subscribe((data) => {
        this.totalAllocatedQty = this.totalAllocatedQty + data.content[0].totalFertilizerAllocated;
        this.createForm.controls.allocatedQty.setValue(this.totalAllocatedQty);
      });
      this.selectedCoveredSectors.push(item.name);
    } else {
      let i: number;
      i = this.createForm.value.coveredAreas.coveredSectors.indexOf(item._id);
      if (i > -1) {
        this.createForm.controls.coveredAreas.get('coveredSectors'.toString()).value.splice(i, 1);
        this.siteService.getSectorAllocatedFertilizer(item._id).subscribe((data) => {
          this.totalAllocatedQty = this.totalAllocatedQty - data.content[0].totalFertilizerAllocated;
          this.createForm.controls.allocatedQty.setValue(this.totalAllocatedQty);
        });
        this.selectedCoveredSectors.splice(i, 1);
      }
    }
  }

  onChanges() {
    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.coveredSectorsSet = null;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
        }
      }
    );
    this.createForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          const body = {
            searchBy: 'district',
            dist_id: value
          };
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.coveredSectorsSet = data;
            this.cells = null;
            this.villages = null;
          });
          this.siteService.getZone(body).subscribe((zones) => {
            this.coveredCWSSet = zones.content;
          });
        }
      }
    );
    this.createForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.createForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
          });
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
