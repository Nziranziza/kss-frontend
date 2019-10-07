import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SiteService} from '../../../core/services';
import {LocationService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.css']
})
export class SiteEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute,
              private router: Router, private siteService: SiteService,
              private locationService: LocationService,
              private helper: HelperService) {
  }

  editForm: FormGroup;
  errors: string[];
  organisations: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  coveredSectorsSet = [];
  coveredCWSSet = [];
  selectedCoveredCWS = [];
  selectedCoveredSectors = [];
  id: string;
  totalAllocatedQty = 0;

  ngOnInit() {
    this.editForm = this.formBuilder.group({
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
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.siteService.get(params['id'.toString()]).subscribe(data => {
        const site = data.content;
        this.locationService.getProvinces().subscribe((provinces) => {
          this.provinces = provinces;
        });
        site.coveredAreas.coveredCWS.map((cws) => {
          this.selectedCoveredCWS = [];
          const restoreCoveredCWS = [];
          restoreCoveredCWS.push(cws.org_id);
          this.selectedCoveredCWS.push(cws.name);
          site.coveredAreas.coveredCWS = restoreCoveredCWS;
        });
        site.coveredAreas.coveredSectors.map((sector) => {
          this.selectedCoveredSectors = [];
          const restoreCoveredSectors = [];
          restoreCoveredSectors.push(sector.sect_id);
          this.siteService.getSectorAllocatedFertilizer(sector.sect_id).subscribe((qty) => {
            this.totalAllocatedQty = this.totalAllocatedQty + qty.content[0].totalFertilizerAllocated;
            this.editForm.controls.allocatedQty.setValue(this.totalAllocatedQty);
          });
          this.selectedCoveredSectors.push(sector.name);
          site.coveredAreas.coveredSectors = restoreCoveredSectors;
          this.locationService.getSectors(site.location.dist_id).subscribe((items) => {
            this.coveredSectorsSet = items;
          });
          const body = {
            searchBy: 'district',
            dist_id: site.location.dist_id
          };
          this.siteService.getZone(body).subscribe(zone => {
            if (zone) {
              this.coveredCWSSet = zone.content;
            }
          });
        });
        this.locationService.getDistricts(site.location.prov_id).subscribe((districts) => {
          this.districts = districts;
        });
        this.locationService.getSectors(site.location.dist_id).subscribe((sectors) => {
          this.sectors = sectors;
        });
        this.locationService.getCells(site.location.sect_id).subscribe((cells) => {
          this.cells = cells;
        });
        this.locationService.getVillages(site.location.cell_id).subscribe((villages) => {
          this.villages = villages;
        });
        this.editForm.patchValue(site);
        this.editForm.controls.coveredAreas.get('coveredSectors'.toString()).patchValue(site.coveredAreas.coveredSectors);
        this.editForm.controls.coveredAreas.get('coveredCWS'.toString()).patchValue(site.coveredAreas.coveredCWS);
      });
    });
    this.initial();
  }

  onSubmit() {
    if (this.editForm.valid) {
      const val = this.editForm.value;
      const site = JSON.parse(JSON.stringify(val));
      delete site.allocatedQty;
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
        const CWS = this.coveredCWSSet.find(obj => obj._id === id);
        if (CWS) {
          tempCWS.push({
            org_id: id,
            name: CWS.organizationName
          });
        }
        site.coveredAreas.coveredCWS = tempCWS;
      });
      /* Edit not enabled */
      this.router.navigateByUrl('admin/sites');
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }

  public onMouseDownCWS(event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'.toString()] = !event.target['selected'.toString()];
    if (event.target['selected'.toString()]) {
      this.editForm.controls.coveredAreas.get('coveredCWS'.toString()).value.push(item._id);
      this.selectedCoveredCWS.push(item.organizationName);
    } else {
      let i: number;
      i = this.editForm.value.coveredAreas.coveredCWS.indexOf(item._id);
      if (i > -1) {
        this.editForm.controls.coveredAreas.get('coveredCWS'.toString()).value.splice(i, 1);
        this.selectedCoveredCWS.splice(i, 1);
      }
    }
  }

  public onMouseDownSector(event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'.toString()] = !event.target['selected'.toString()];
    if (event.target['selected'.toString()]) {
      this.editForm.controls.coveredAreas.get('coveredSectors'.toString()).value.push(item._id);
      this.siteService.getSectorAllocatedFertilizer(item._id).subscribe((data) => {
        this.totalAllocatedQty = this.totalAllocatedQty + data.content[0].totalFertilizerAllocated;
        this.editForm.controls.allocatedQty.setValue(this.totalAllocatedQty);
      });
      this.selectedCoveredSectors.push(item.name);
    } else {
      let i: number;
      i = this.editForm.value.coveredAreas.coveredSectors.indexOf(item._id);
      if (i > -1) {
        this.editForm.controls.coveredAreas.get('coveredSectors'.toString()).value.splice(i, 1);
        this.siteService.getSectorAllocatedFertilizer(item._id).subscribe((data) => {
          this.totalAllocatedQty = this.totalAllocatedQty - data.content[0].totalFertilizerAllocated;
          this.editForm.controls.allocatedQty.setValue(this.totalAllocatedQty);
        });
        this.selectedCoveredSectors.splice(i, 1);
      }
    }
  }

  onChanges() {
    this.editForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.editForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
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
    this.editForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      }
    );
    this.editForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
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
