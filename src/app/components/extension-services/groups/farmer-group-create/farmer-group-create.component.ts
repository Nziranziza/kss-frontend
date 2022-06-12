import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {
  AuthenticationService,
  BasicComponent,
  HelperService, LocationService,
  MessageService,
  OrganisationService
} from '../../../../core';
import {isEmptyObject} from 'jquery';

@Component({
  selector: 'app-farmer-group-create',
  templateUrl: './farmer-group-create.component.html',
  styleUrls: ['./farmer-group-create.component.css']
})
export class FarmerGroupCreateComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private router: Router, private organisationService: OrganisationService,
              private messageService: MessageService,
              private authenticationService: AuthenticationService,
              protected locationService: LocationService,
              private helper: HelperService) {
    super(locationService, organisationService);
  }

  createForm: FormGroup;
  errors: any;
  provinces: any;
  filterForm: FormGroup;
  parameters: any;
  loading = false;
  org: any;
  searchResults: any;
  selectedResults: any[];
  allResultsSelected: boolean;
  searchByLocation = true;
  groupMembers: any[];
  selectedGroupMembers: any[];
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
      leaderNames: [''],
      leaderPhoneNumber: [''],
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
      org_id: this.authenticationService.getCurrentUser().info.org_id
    };

    this.filterForm = this.formBuilder.group({
      searchOption: ['location'],
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
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
  }

  onSubmit() {
    if (this.createForm.valid) {
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

  selectAllResults(isChecked: boolean) {
    if (isChecked) {
      this.searchResults.forEach((item) => {
        item.selected = true;
      });
    } else {
      this.searchResults.forEach((item) => {
        item.selected = false;
      });
    }
    this.allResultsSelected = isChecked;
  }

  selectResultsItem(isChecked: boolean, i: number) {
    this.searchResults[i].selected = isChecked;
    if (!isChecked) {
      this.allResultsSelected = false;
    }
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      const filter = JSON.parse(JSON.stringify(this.filterForm.value));
      delete filter.searchOption;
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
          this.searchResults = data.data;
          this.loading = false;
        },
        (err) => {
          this.loading = false;
          this.errors = err.errors;
        }
      );
    }
  }

  onChanges() {
    this.createForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangeProvince(this.createForm, value);
      }
    );
    this.createForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangDistrict(this.createForm, value);
      }
    );
    this.createForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangSector(this.createForm, value);
      }
    );
    this.createForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangCell(this.createForm, value);
      }
    );
    this.filterForm.controls.searchByLocation
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getCells(value).subscribe((data) => {
          this.basicCoveredCells = this.filterZoningCells(this.basicOrg.coveredSectors, value);
          this.basicCoveredVillages = null;
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});
        });
      } else {
        this.basicCoveredCells = null;
        this.basicCoveredVillages = null;
        this.filterForm.controls.searchByLocation
          .get('cell_id'.toString()).setValue('', {emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('village_id'.toString()).setValue('', {emitEvent: false});
      }
    });
    this.filterForm.controls.searchOption
      .valueChanges.subscribe((value) => {
      if (value !== '' && value === 'location') {
        this.searchByLocation = true;
        this.filterForm.controls.searchByTerm.get('term').setValue('');
      } else {
        this.filterForm.controls.searchByLocation
          .get('sect_id'.toString()).setValue('', {emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('cell_id'.toString()).setValue('', {emitEvent: false});
        this.filterForm.controls.searchByLocation
          .get('village_id'.toString()).setValue('', {emitEvent: false});
        this.searchByLocation = false;
      }
    });
    this.filterForm.controls.searchByLocation
      .get('cell_id'.toString())
      .valueChanges.subscribe((value) => {
      if (value !== '') {
        this.locationService.getVillages(value).subscribe((data) => {
          const id = this.filterForm.controls.searchByLocation
            .get('sect_id'.toString()).value;
          this.basicCoveredVillages = this.filterZoningVillages(this.basicOrg.coveredSectors, id, data);
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', {emitEvent: false});

        });
      }
    });
  }

}
