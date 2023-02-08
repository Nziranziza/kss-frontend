import {Component, OnInit} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, AuthorisationService, OrganisationService, OrganisationTypeService} from '../../../core';
import {HelperService} from '../../../core';
import {LocationService} from '../../../core';
import {MessageService} from '../../../core';
import {BasicComponent} from '../../../core';

@Component({
  selector: 'app-organisation-edit',
  templateUrl: './organisation-edit.component.html',
  styleUrls: ['./organisation-edit.component.css']
})
export class OrganisationEditComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute, private router: Router, private helper: HelperService,
              private organisationService: OrganisationService, private locationService: LocationService,
              private authenticationService: AuthenticationService,
              private authorisationService: AuthorisationService,
              private organisationTypeService: OrganisationTypeService, private messageService: MessageService) {
    super();
  }

  editForm: UntypedFormGroup;
  errors: any;
  genres: any[];
  possibleRoles: any[];
  partners: any[];
  provinces: any;
  districts: any;
  sectors: any;
  organisation: any;
  cells: any;
  villages: any;
  needLocation = false;
  selectedRoles: any;
  selectedPartners: any;
  id: string;
  coverVillages = false;
  disableProvId = false;
  disableDistId = false;
  isSuperOrg = false;
  coveredVillagesSet = [[]];
  coveredCellsSet = [[]];
  selectedCoveredVillages = [[]];
  selectedCoveredCells = [[]];
  coveredSectorsList: UntypedFormArray;
  showPartners = false;
  hasExpiration = false;
  isUserDCC = false;

  ngOnInit() {
    if (this.authorisationService.isDistrictCashCropOfficer()) {
      this.disableDistId = true;
      this.disableProvId = true;
      this.isUserDCC = true;
    }
    this.editForm = this.formBuilder.group({
      organizationName: [''],
      email: [''],
      phone_number: [''],
      genreId: [''],
      streetNumber: [''],
      location: this.formBuilder.group({
        prov_id: [{disabled: this.disableProvId, value: ''}],
        dist_id: [{disabled: this.disableDistId, value: ''}],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      organizationRole: new UntypedFormArray([]),
      organizationPartner: new UntypedFormArray([]),
      coveredSectors: new UntypedFormArray([]),
      contractStartingDate: [''],
      contractEndingDate: [''],
    });
    this.organisationTypeService.all().subscribe(types => {
      this.genres = types.content;
    });
    this.onChanges();
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.organisationService.get(params['id'.toString()]).subscribe(data => {
        this.organisationService.possibleRoles().subscribe(roles => {
          this.possibleRoles = Object.keys(roles.content).map(key => {
            return {name: [key], value: roles.content[key]};
          });
          this.possibleRoles.map(role => {
            if (data.content.organizationRole.includes(role.value)) {
              const control = new UntypedFormControl(true);
              (this.editForm.controls.organizationRole as UntypedFormArray).push(control);
            } else {
              const control = new UntypedFormControl(false);
              (this.editForm.controls.organizationRole as UntypedFormArray).push(control);
            }
          });
        });
        this.organisationService.getOrgByRoles({roles: [11]}).subscribe(partners => {
          this.partners = partners.content;
          this.partners.map(partner => {
            if (partner._id !== this.id) {
              if (data.content.organizationPartner &&
                data.content.organizationPartner.findIndex(p => p._id === partner._id) !== -1) {
                const control = new UntypedFormControl(true);
                (this.editForm.controls.organizationPartner as UntypedFormArray).push(control);
              } else {
                const control = new UntypedFormControl(false);
                (this.editForm.controls.organizationPartner as UntypedFormArray).push(control);
              }
              this.showPartners = true;
            }
          });
        });
        this.organisation = JSON.parse(JSON.stringify(data.content));
        const org = data.content;
        this.isSuperOrganisation(org);
        org['genreId'.toString()] = org.genre._id;
        delete org.genre;
        if (
          org.organizationRole.includes(1) ||
          org.organizationRole.includes(2)) {
          if (org.location) {
            org['location'.toString()]['prov_id'.toString()] = org.location.prov_id ? org.location.prov_id._id : '';
            org['location'.toString()]['dist_id'.toString()] = org.location.dist_id ? org.location.dist_id._id : '';
            org['location'.toString()]['sect_id'.toString()] = org.location.sect_id ? org.location.sect_id._id : '';
            org['location'.toString()]['cell_id'.toString()] = org.location.cell_id ? org.location.cell_id._id : '';
            org['location'.toString()]['village_id'.toString()] = org.location.village_id ? org.location.village_id._id : '';
            delete org.location._id;
          }
          this.needLocation = true;
        } else {
          this.needLocation = false;
        }
        this.hasExpiration = org.organizationRole.includes(8) && (!org.organizationRole.includes(1));
        this.locationService.getProvinces().subscribe((provinces) => {
          this.provinces = provinces;
        });
        if (org.location) {
          org.coveredSectors.map((sector, index) => {
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
            org.coveredSectors[index].coveredVillages = restoreCoveredVillages;
            org.coveredSectors[index].coveredCells = restoreCoveredCells;
            org.coveredSectors[index].sectorId = sector.sectorId._id;
          });
          this.locationService.getDistricts(org.location.prov_id).subscribe((districts) => {
            this.districts = districts;
          });
          this.locationService.getSectors(org.location.dist_id).subscribe((sectors) => {
            this.sectors = sectors;
            org.coveredSectors.map((sector, index) => {
              this.locationService.getCoveredVillages(sector.sectorId).subscribe((items) => {
                this.coveredVillagesSet[index] = items;
              });
              this.locationService.getCells(sector.sectorId).subscribe((items) => {
                this.coveredCellsSet[index] = items;
              });
            });
          });
          this.locationService.getCells(org.location.sect_id).subscribe((cells) => {
            this.cells = cells;
          });
          this.locationService.getVillages(org.location.cell_id).subscribe((villages) => {
            this.villages = villages;
          });
          if (org.organizationRole.includes(1)) {
            this.coverVillages = true;
          }
          this.editForm.patchValue(org, {emitEvent: false});
          org.coveredSectors.map((sector, index) => {
            (this.editForm.controls.coveredSectors as UntypedFormArray).push(this.newCoveredSector());
            this.getCoveredSectorsFormGroup(index).patchValue(sector, {emitEvent: false});
          });
        } else {
          if (org.location === null) {
            delete org.location;
          }
          this.editForm.controls['genreId'.toString()].setValue(org.genreId);
          this.editForm.patchValue(org, {emitEvent: false});
        }
      });
    });
  }

  isSuperOrganisation(organisation: any) {
    this.isSuperOrg = organisation.organizationRole.indexOf(0) > -1;
  }

  newCoveredSector(): UntypedFormGroup {
    return this.formBuilder.group({
      coveredVillages: [[]],
      coveredCells: [[]],
      sectorId: ['']
    });
  }

  get formCoveredSectors() {
    return this.editForm.get('coveredSectors') as UntypedFormArray;
  }

  addCoveredSector() {
    (this.editForm.controls.coveredSectors as UntypedFormArray).push(this.newCoveredSector());
    this.coveredCellsSet.push([]);
    this.selectedCoveredCells.push([]);
    this.coveredVillagesSet.push([]);
    this.selectedCoveredVillages.push([]);
  }

  removeCoveredSector(index: number) {
    (this.editForm.controls.coveredSectors as UntypedFormArray).removeAt(index);
  }

  getCoveredSectorsFormGroup(index): UntypedFormGroup {
    this.coveredSectorsList = this.editForm.get('coveredSectors') as UntypedFormArray;
    return this.coveredSectorsList.controls[index] as UntypedFormGroup;
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

  onSubmit() {
    if (this.editForm.valid) {
      const selectedRoles = this.editForm.value.organizationRole
        .map((checked, index) => checked ? this.possibleRoles[index].value : null)
        .filter(value => value !== null);
      if(this.isSuperOrg) {
        this.selectedRoles.push(0);
      }
      console.log(selectedRoles);
      const selectedPartners = this.editForm.value.organizationPartner
        .map((checked, index) => checked ? this.partners[index]._id : null)
        .filter(value => value !== null);
      const val = this.editForm.value;
      const org = JSON.parse(JSON.stringify(val));
      org['organizationRole'.toString()] = selectedRoles;
      org['organizationPartner'.toString()] = selectedPartners;
      if (!(selectedRoles.includes(1) || selectedRoles.includes(2))) {
        delete org.location;
      } else if (this.authorisationService.isDistrictCashCropOfficer()) {
        org['location'.toString()]['prov_id'.toString()] = this.organisation.location.prov_id ? this.organisation.location.prov_id._id : '';
        org['location'.toString()]['dist_id'.toString()] = this.organisation.location.dist_id ? this.organisation.location.dist_id._id : '';
      }
      if (!(selectedRoles.includes(1))) {
        delete org.coveredVillages;
        delete org.coveredSectors;
      }
      if (!(selectedRoles.includes(8))) {
        delete org.startingDate;
        delete org.expirationDate;
      }
      // is organisation a cws ?
      if (selectedRoles.includes(1)) {
        org.coveredSectors.map((sectors, index) => {
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
      this.organisationService.update(org, this.id).subscribe(data => {
          this.messageService.setMessage('organisation successfully updated!');
          this.router.navigateByUrl('admin/organisations');
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.editForm));
    }
  }

  onChanges() {
    this.editForm.controls['organizationPartner'.toString()].valueChanges.subscribe(
      (data) => {
        this.selectedPartners = data
          .map((checked, index) => checked ? this.partners[index]._id : null)
          .filter(value => value !== null);
      });
    this.editForm.controls['organizationRole'.toString()].valueChanges.subscribe(
      (data) => {
        this.selectedRoles = data
          .map((checked, index) => checked ? this.possibleRoles[index].value : null)
          .filter(value => value !== null);
        this.needLocation = !!(this.selectedRoles.includes(1) || this.selectedRoles.includes(2));
        if (this.selectedRoles.includes(1)) {
          this.coverVillages = true;
          if (this.formCoveredSectors.length < 1) {
            this.addCoveredSector();
          }
        } else {
          this.coverVillages = false;
          // this.coveredVillagesSet = [];
          // this.editForm.controls.coveredSectors.reset();
        }
        this.hasExpiration = this.selectedRoles.includes(8) && (!this.selectedRoles.includes(1));
      });
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
}
