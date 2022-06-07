import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService, LocationService, MessageService, OrganisationService, OrganisationTypeService} from '../../../../core';
import {isEmptyObject} from 'jquery';

@Component({
  selector: 'app-farmer-group-create',
  templateUrl: './farmer-group-create.component.html',
  styleUrls: ['./farmer-group-create.component.css']
})
export class FarmerGroupCreateComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private messageService: MessageService,
              private helper: HelperService, private organisationTypeService: OrganisationTypeService,
              private locationService: LocationService) {
  }

  createForm: FormGroup;
  errors: any;
  provinces: any;
  filterForm: FormGroup;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  coveredSectors: any;
  parameters: any;
  coveredCells: any;
  coveredVillages: any;
  searchLocationBy = 'farmer';
  paginatedFarmers: any;
  loading = false;
  org: any;
  searchFields = [
    {value: 'reg_number', name: 'registration number'},
    {value: 'nid', name: 'NID'},
    {value: 'forename', name: 'first name'},
    {value: 'surname', name: 'last name'},
    {value: 'groupname', name: 'group name'},
    {value: 'phone_number', name: 'phone number'},
  ];

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      groupName: [''],
      groupLeaderName: [''],
      groupLeaderPhoneNumber: [''],
      description: [''],
      meetingSchedule: [''],
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      })
    });
    this.parameters = {
      length: 10,
      start: 0,
      draw: 1,
      org_id: null
    };

    this.filterForm = this.formBuilder.group({
      searchByLocation: this.formBuilder.group({
        searchBy: ['farmer_location'],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      searchByTerm: this.formBuilder.group({
        term: ['', Validators.minLength(3)],
        searchBy: ['reg_number'],
      }),
    });
    this.initial();
    this.onChanges();
  }

  onSubmit() {
    if (this.createForm.valid) {
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      const filter = JSON.parse(JSON.stringify(this.filterForm.value));
      if (filter.searchByTerm.term === '') {
        delete filter.searchByTerm;
      }
      const location = filter.searchByLocation;
      if (location) {
          if (location.village_id !== '') {
            filter.searchByLocation.filterBy = 'village';
            filter.searchByLocation.village_id = location.village_id;
          } else if (location.cell_id !== '') {
            filter.searchByLocation.filterBy = 'cell';
            filter.searchByLocation.cell_id = location.cell_id;
          } else if (location.sect_id !== '') {
            filter.searchByLocation.filterBy = 'sector';
            filter.searchByLocation.sect_id = location.sect_id;
          } else if (location.dist_id !== '') {
            if (this.searchLocationBy !== 'farm') {
              filter.searchByLocation.filterBy = 'district';
              filter.searchByLocation.dist_id = location.dist_id;
            } else {
              delete filter.searchByLocation;
            }
          } else {
            delete filter.searchByLocation;
          }
        }
      this.helper.cleanObject(filter.searchByLocation);

      if (!isEmptyObject(filter)) {
        this.parameters['search'.toString()] = filter;
      } else {
        delete this.parameters.search;
      }
      this.organisationService.getFarmers(this.parameters).subscribe(
        (data) => {
          this.paginatedFarmers = data.data;
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.errors = err.errors;
        }
      );
    }
  }

  onClearFilter() {
    this.filterForm.controls.term.setValue('', {emitEvent: false});
    delete this.parameters.search;
    this.organisationService.getFarmers(this.parameters).subscribe((data) => {
      this.paginatedFarmers = data.data;
    });
  }

  getFarmers(): void {
    this.loading = true;
    this.organisationService.getFarmers(this.parameters).subscribe((data) => {
      if (data.data.length === 0) {
      } else {
        this.paginatedFarmers = data.data;
      }
      this.loading = false;
    });
  }
  onChanges() {
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
