import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../../core/helpers';
import {SiteService} from '../../../core/services';
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
  coveredVillagesSet = [];
  coveredCellsSet = [];
  selectedCoveredVillages = [];
  selectedCoveredCells = [];
  coveredSectorsList: FormArray;

  ngOnInit() {
    this.createForm = this.formBuilder.group({
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
    this.initial();
    this.addCoveredSector();
    this.onChanges();
  }

  onSubmit() {
    if (this.createForm.valid) {
      const val = this.createForm.value;
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
      this.errors = this.helper.getFormValidationErrors(this.createForm);
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
    return this.createForm.get('coveredSectors') as FormArray;
  }

  addCoveredSector() {
    (this.createForm.controls.coveredSectors as FormArray).push(this.newCoveredSector());
    this.coveredCellsSet.push([]);
    this.selectedCoveredCells.push([]);
    this.coveredVillagesSet.push([]);
    this.selectedCoveredVillages.push([]);
  }

  removeCoveredSector(index: number) {
    (this.createForm.controls.coveredSectors as FormArray).removeAt(index);
  }

  getCoveredSectorsFormGroup(index): FormGroup {
    this.coveredSectorsList = this.createForm.get('coveredSectors') as FormArray;
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
      i = this.createForm.value.coveredSectors[index].coveredVillages.indexOf(item._id);
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
      i = this.createForm.value.coveredSectors[index].coveredCells.indexOf(item._id);
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
    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
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
    this.createForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
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
