import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {OrganisationService, OrganisationTypeService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {LocationService} from '../../core/services/location.service';

@Component({
  selector: 'app-organisation-create',
  templateUrl: './organisation-create.component.html',
  styleUrls: ['./organisation-create.component.css']
})
export class OrganisationCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService) {
  }

  createForm: FormGroup;
  errors: any;
  genres: any[];
  possibleRoles: any[];
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  needLocation = false;
  coverVillages = false;
  coveredVillagesSet = [];
  coveredCellsSet = [];
  selectedCoveredVillages = [];
  selectedCoveredCells = [];
  selectedRoles: any;
  coveredSectorsList: FormArray;

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      organizationName: [''],
      email: [''],
      phone_number: [''],
      genreId: [''],
      streetNumber: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      organizationRole: new FormArray([]),
      coveredSectors: new FormArray([]),
      /*usersNIDRequired: ['']*/
    });

    this.organisationTypeService.all().subscribe(data => {
      this.genres = data.content;
    });
    this.organisationService.possibleRoles().subscribe(data => {
      this.possibleRoles = Object.keys(data.content).map(key => {
        return {name: [key], value: data.content[key]};
      });
      this.possibleRoles.map(role => {
        const control = new FormControl(false);
        (this.createForm.controls.organizationRole as FormArray).push(control);
      });
    });
    this.initial();
    this.onChanges();
  }

  onSubmit() {
    if (this.createForm.valid) {
      const selectedRoles = this.createForm.value.organizationRole
        .map((checked, index) => checked ? this.possibleRoles[index].value : null)
        .filter(value => value !== null);
      const val = this.createForm.value;
      const org = JSON.parse(JSON.stringify(val));
      org['organizationRole'.toString()] = selectedRoles;
      if (!(selectedRoles.includes(1) || selectedRoles.includes(2))) {
        delete org.location;
      }
      if (!(selectedRoles.includes(1))) {
        delete org.coveredVillages;
        delete org.coveredSectors;
      }
      // is organisation a cws ?
      if (selectedRoles.includes(1)) {
        const tempo = [];
        const temp = [];
        org.coveredSectors.map((sectors, index) => {
          sectors.coveredVillages.map((id) => {
            const village = this.coveredVillagesSet[index].find(obj => obj._id === id);
            if (village) {
              tempo.push({
                village_id: id,
                name: village.name
              });
            }
            org.coveredSectors[index].coveredVillages = tempo;
          });
          sectors.coveredCells.map((id) => {
            const cell = this.coveredCellsSet[index].find(obj => obj._id === id);
            if (cell) {
              temp.push({
                cell_id: id,
                name: cell.name
              });
            }
            org.coveredSectors[index].coveredCells = temp;
          });
        });
      }
      this.helper.cleanObject(org);
      this.organisationService.save(org)
        .subscribe(data => {
            this.router.navigateByUrl('admin/organisations');
          },
          (err) => {
            this.errors = err.errors;
          });
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
    this.createForm.controls['organizationRole'.toString()].valueChanges.subscribe(
      (data) => {
        this.selectedRoles = data
          .map((checked, index) => checked ? this.possibleRoles[index].value : null)
          .filter(value => value !== null);
        if (
          this.selectedRoles.includes(1) ||
          this.selectedRoles.includes(2)) {
          this.needLocation = true;
        } else {
          this.needLocation = false;
        }
        if (
          this.selectedRoles.includes(1)) {
          this.coverVillages = true;
          this.addCoveredSector();
        } else {
          this.coverVillages = false;
          this.coveredVillagesSet = [];
          this.createForm.controls.coveredSectors.reset();
        }
      });
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
