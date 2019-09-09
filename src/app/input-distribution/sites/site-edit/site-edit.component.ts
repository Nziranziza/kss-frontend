import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {SiteService} from '../../../core/services';
import {LocationService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {OrganisationService} from '../../../core/services';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.component.html',
  styleUrls: ['./site-edit.component.css']
})
export class SiteEditComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute,
              private router: Router, private siteService: SiteService,
              private locationService: LocationService,
              private helper: HelperService, private organisationService: OrganisationService) {
  }

  editForm: FormGroup;
  errors: string[];
  organisations: any;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  id: string;
  coveredVillagesSet = [[]];
  coveredCellsSet = [[]];
  selectedCoveredVillages = [[]];
  selectedCoveredCells = [[]];
  coveredSectorsList: FormArray;

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      siteName: [''],
      belongingZone: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      coveredSectors: new FormArray([])
    });
    this.organisationService.all().subscribe((data) => {
      this.organisations = data.content;
    });
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.siteService.get(params['id'.toString()]).subscribe(data => {
        this.editForm.patchValue(data.content);
      });
    });
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.siteService.get(params['id'.toString()]).subscribe(data => {
        const site = data.content;
        if (site.location) {
          site['location'.toString()]['prov_id'.toString()] = site.location.prov_id._id;
          site['location'.toString()]['dist_id'.toString()] = site.location.dist_id._id;
          site['location'.toString()]['sect_id'.toString()] = site.location.sect_id._id;
          site['location'.toString()]['cell_id'.toString()] = site.location.cell_id._id;
          site['location'.toString()]['village_id'.toString()] = site.location.village_id._id;
        }
        this.locationService.getProvinces().subscribe((provinces) => {
          this.provinces = provinces;
        });

        site.coveredSectors.map((sector, index) => {
          this.selectedCoveredVillages[index] = [];
          this.selectedCoveredCells[index] = [];
          const restoreCoveredVillages = [];
          const restoreCoveredCells = [];
          sector.coveredVillages.map((obj) => {
            restoreCoveredVillages.push(obj.village_id);
            this.selectedCoveredVillages[index].push(obj.name);
          });
          sector.coveredCells.map((obj) => {
            restoreCoveredCells.push(obj.cell_id);
            this.selectedCoveredCells[index].push(obj.name);
          });
          site.coveredSectors[index].coveredVillages = restoreCoveredVillages;
          site.coveredSectors[index].coveredCells = restoreCoveredCells;
        });
        this.locationService.getDistricts(site.location.prov_id).subscribe((districts) => {
          this.districts = districts;
        });
        this.locationService.getSectors(site.location.dist_id).subscribe((sectors) => {
          this.sectors = sectors;
          site.coveredSectors.map((sector, index) => {
            this.locationService.getCoveredVillages(sector.sectorId).subscribe((items) => {
              this.coveredVillagesSet[index] = items;
            });
            this.locationService.getCells(sector.sectorId).subscribe((items) => {
              this.coveredCellsSet[index] = items;
            });
          });
        });
        this.locationService.getCells(site.location.sect_id).subscribe((cells) => {
          this.cells = cells;
        });
        this.locationService.getVillages(site.location.cell_id).subscribe((villages) => {
          this.villages = villages;
        });

        this.editForm.patchValue(site);
        site.coveredSectors.map((sector, index) => {
          this.addCoveredSector();
          this.getCoveredSectorsFormGroup(index).patchValue(sector);
        });

      });
    });
    this.initial();
    this.onChanges();
  }

  onSubmit() {
    if (this.editForm.valid) {
      const val = this.editForm.value;
      const site = JSON.parse(JSON.stringify(val));
      site.coveredSectors.map((sectors, index) => {
        const tempo = [];
        const temp = [];
        sectors.coveredVillages.map((id) => {
          const village = this.coveredVillagesSet[index].find(obj => obj._id === id);
          if (village) {
            tempo.push({
              village_id: id,
              name: village.name
            });
          }
          site.coveredSectors[index].coveredVillages = tempo;
        });
        sectors.coveredCells.map((id) => {
          const cell = this.coveredCellsSet[index].find(obj => obj._id === id);
          if (cell) {
            temp.push({
              cell_id: id,
              name: cell.name
            });
          }
          site.coveredSectors[index].coveredCells = temp;
        });
      });
      this.helper.cleanObject(site);
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }

  newCoveredSector(): FormGroup {
    return this.formBuilder.group({
      coveredCells: [[]],
      coveredVillages: [[]],
      sectorId: ['']
    });
  }

  get formCoveredSectors() {
    return this.editForm.get('coveredSectors') as FormArray;
  }

  addCoveredSector() {
    (this.editForm.controls.coveredSectors as FormArray).push(this.newCoveredSector());
    this.coveredCellsSet.push([]);
    this.selectedCoveredCells.push([]);
    this.coveredVillagesSet.push([]);
    this.selectedCoveredVillages.push([]);
  }

  removeCoveredSector(index: number) {
    (this.editForm.controls.coveredSectors as FormArray).removeAt(index);
  }

  getCoveredSectorsFormGroup(index): FormGroup {
    this.coveredSectorsList = this.editForm.get('coveredSectors') as FormArray;
    return this.coveredSectorsList.controls[index] as FormGroup;
  }

  onChangeSector(index: number) {
    this.selectedCoveredVillages[index] = [];
    this.selectedCoveredCells[index] = [];
    this.getCoveredSectorsFormGroup(index).controls['coveredCells'.toString()].setValue([]);
    this.getCoveredSectorsFormGroup(index).controls['coveredVillages'.toString()].setValue([]);

    this.locationService.getCoveredVillages(this.getCoveredSectorsFormGroup(index)
      .controls['sectorId'.toString()].value).subscribe((items) => {
      this.coveredVillagesSet[index] = items;
    });

    this.locationService.getCells(this.getCoveredSectorsFormGroup(index)
      .controls['sectorId'.toString()].value).subscribe((items) => {
      this.coveredCellsSet[index] = items;
    });
  }

  public onMouseDownVillage(index, event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'.toString()] = !event.target['selected'.toString()];
    if (event.target['selected'.toString()]) {
      this.getCoveredSectorsFormGroup(index).controls['coveredVillages'.toString()].value.push(item._id);
      this.selectedCoveredVillages[index].push(item.name);
    } else {
      let i: number;
      i = this.editForm.value.coveredSectors[index].coveredVillages.indexOf(item._id);
      if (i > -1) {
        this.getCoveredSectorsFormGroup(index).controls['coveredVillages'.toString()].value.splice(i, 1);
        this.selectedCoveredVillages[index].splice(i, 1);
      }
    }
  }

  public onMouseDownCell(index, event: MouseEvent, item) {
    event.preventDefault();
    event.target['selected'.toString()] = !event.target['selected'.toString()];
    if (event.target['selected'.toString()]) {
      this.getCoveredSectorsFormGroup(index).controls['coveredCells'.toString()].value.push(item._id);
      this.selectedCoveredCells[index].push(item.name);
      const ids = this.getCoveredSectorsFormGroup(index).controls['coveredVillages'.toString()].value;
      this.locationService.getVillages(item._id).subscribe((villages) => {
        villages.map((village) => {
          if (!(ids.indexOf(village._id) > -1)) {
            ids.push(village._id);
          }
          if (!(this.selectedCoveredVillages[index].indexOf(village.name) > -1)) {
            this.selectedCoveredVillages[index].push(village.name);
          }
        });
        this.getCoveredSectorsFormGroup(index).controls['coveredVillages'.toString()].setValue(ids);
      });
    } else {
      let i: number;
      i = this.editForm.value.coveredSectors[index].coveredCells.indexOf(item._id);
      if (i > -1) {
        this.getCoveredSectorsFormGroup(index).controls['coveredCells'.toString()].value.splice(i, 1);
        this.selectedCoveredCells[index].splice(i, 1);
        const ids = this.getCoveredSectorsFormGroup(index).controls['coveredVillages'.toString()].value;
        this.locationService.getVillages(item._id).subscribe((villages) => {
          villages.map((village) => {
            if (ids.indexOf(village._id) > -1) {
              ids.splice(ids.indexOf(village._id), 1);
            }
            if (this.selectedCoveredVillages[index].indexOf(village.name) > -1) {
              this.selectedCoveredVillages[index].splice(this.selectedCoveredVillages[index].indexOf(village.name), 1);
            }
          });
          this.getCoveredSectorsFormGroup(index).controls['coveredVillages'.toString()].setValue(ids);
        });
      }
    }
  }

  onChanges() {
    this.editForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.editForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
            this.coveredVillagesSet = [];
            this.coveredCellsSet = [];
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
