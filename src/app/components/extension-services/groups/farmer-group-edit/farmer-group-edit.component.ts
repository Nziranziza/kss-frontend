import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthenticationService,
  BasicComponent,
  GroupService,
  HelperService,
  LocationService,
  MessageService,
  OrganisationService, UserService
} from '../../../../core';
import { isEmptyObject } from 'jquery';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';

@Component({
  selector: 'app-farmer-group-edit',
  templateUrl: './farmer-group-edit.component.html',
  styleUrls: ['./farmer-group-edit.component.css']
})
export class FarmerGroupEditComponent extends BasicComponent implements OnInit {
  districts: any[] = [];
  createForm: any[] = [];
  sectors: any[] = [];

  constructor(private formBuilder: UntypedFormBuilder,
    private router: Router, private organisationService: OrganisationService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private userService: UserService,
    private groupService: GroupService,
    private authenticationService: AuthenticationService,
    protected locationService: LocationService,
    private readonly sso: ScrollStrategyOptions,
    private helper: HelperService) {
    super(locationService, organisationService);
    this.scrollStrategy = this.sso.noop();
  }

  editForm: UntypedFormGroup;
  errors: any;
  provinces: any;
  filterForm: UntypedFormGroup;
  editContactForm: UntypedFormGroup;
  parameters: any;
  loading = false;
  org: any;
  searchResults: any;
  allResultsSelected: boolean;
  allMembersSelected: boolean;
  searchByLocation = true;
  groupMembers = [];
  time: any;
  id: string;
  initialValue = '';
  keyword = 'leaderName';
  scrollStrategy: ScrollStrategy;
  searchFields = [
    { value: 'reg_number', name: 'registration number' },
    { value: 'nid', name: 'NID' },
    { value: 'forename', name: 'first name' },
    { value: 'surname', name: 'last name' },
    { value: 'groupname', name: 'group name' },
    { value: 'phone_number', name: 'phone number' },
  ];
  days = [
    { value: 1, name: 'monday' },
    { value: 2, name: 'tuesday' },
    { value: 3, name: 'wednesday' },
    { value: 4, name: 'thursday' },
    { value: 5, name: 'friday' },
    { value: 6, name: 'saturday' },
    { value: 7, name: 'sunday' }
  ];

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      groupName: [''],
      leaderNames: ['', Validators.required],
      leaderPhoneNumber: ['', Validators.required, Validators.pattern('[0-9]{12}')],
      description: [''],
      meetingSchedule: this.formBuilder.group({
        meetingDay: [''],
        meetingTime: [''],
      }),
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      })
    });
    this.parameters = {
      length: 35,
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
        term: [''],
        searchBy: ['reg_number'],
      }),
    });
    this.editContactForm = this.formBuilder.group({
      contacts: this.formBuilder.array([]),
    });
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });
    this.getGroupDetails();
    this.basicInit(this.authenticationService.getCurrentUser().info.org_id);
    this.onChanges();
  }

  selectEvent(item) {
    this.editForm.controls.leaderNames.setValue(item.leaderName);
    this.editForm.controls.leaderPhoneNumber.setValue(item.phone_number);
  }
  deselectEvent() {
    console.log('---------------');
  }

  // adding new contacts
  addContacts() {
    const departmentControl = (
      this.editContactForm.get('contacts') as UntypedFormArray
    ).controls;
    this.searchResults.forEach((user) => {
      departmentControl.push(
        this.formBuilder.group({
          userId: user.userInfo._id,
          contact: user.userInfo.phone_number,
        })
      );
    });
  }


  addContact(index) {
    this.searchResults[index].editMode = true;
  }

  cancelEditContact(index) {
    this.searchResults[index].editMode = false;
  }

  // submitting the contacts

  submitContact(index) {
    if (this.editContactForm.valid) {
      const arrayControl = this.editContactForm.get('contacts') as UntypedFormArray;
      const traineData = arrayControl.at(index);
      this.searchResults[index].userInfo.phone_number = traineData.value.contact;
      this.searchResults[index].editMode = false;
      this.userService
        .updateBasic({
          id: traineData.value.userId,
          phone_number: traineData.value.contact.toString(),
          lastModifiedBy: {
            _id: this.authenticationService.getCurrentUser().info._id,
            name: this.authenticationService.getCurrentUser().info.surname,
          },
        })
        .subscribe((newdata) => {
          this.loading = false;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editContactForm);
    }
  }
  getGroupDetails() {
    this.groupService.get(this.id).subscribe(data => {
      const members = data.data.members;
      members.map((member) => {
        const item = {
          userInfo: {
            regNumber: '',
            groupName: '',
            foreName: '',
            surname: '',
            phone_number: '',
            _id: member.userId,
          },
          leaderName: '',
          phone_number: '',
          selected: true
        };
        item.userInfo.regNumber = member.regNumber;
        if (member.groupName) {
          item.userInfo.groupName = member.groupName;
        } else {
          item.userInfo.foreName = member.firstName;
          item.userInfo.surname = member.lastName;
        }
        item.leaderName = item.userInfo.groupName ? item.userInfo.groupName : item.userInfo.surname + ' ' + item.userInfo.foreName;
        item.phone_number = member.phoneNumber;
        item.userInfo.phone_number = member.phoneNumber;
        this.groupMembers.push(item);
      });

      this.editForm.controls.location
        .get('prov_id'.toString())
        .setValue(data.data.location.prov_id._id);
      this.editForm.controls.location
        .get('dist_id'.toString())
        .setValue(data.data.location.dist_id._id);
      this.editForm.controls.location
        .get('sect_id'.toString())
        .setValue(data.data.location.sect_id._id);
      this.editForm.controls.location
        .get('cell_id'.toString())
        .setValue(data.data.location.cell_id._id);
      this.editForm.controls.location
        .get('village_id'.toString())
        .setValue(data.data.location.village_id._id);
      this.editForm.controls.meetingSchedule
        .get('meetingDay'.toString())
        .setValue(data.data.meetingSchedule.meetingDay);
      this.editForm.controls.meetingSchedule
        .get('meetingTime'.toString())
        .setValue(data.data.meetingSchedule.meetingTime);
      this.editForm.controls.description.setValue(
        data.data.description
      );
      delete data.data.location
      delete data.data.meetingSchedule
      delete data.data.description
      this.editForm.patchValue(data.data);
    });
  }

  onSubmit() {
    this.editForm.markAllAsTouched();
    if (true) {
      const value = JSON.parse(JSON.stringify(this.editForm.value));
      value.meetingSchedule.meetingDay = +value.meetingSchedule.meetingDay;
      const members = [];
      this.groupMembers.map((member) => {
        members.push(member.userInfo._id);
      });
      value.members = members;
      this.groupService.update(this.id, value).subscribe(
        (data) => {
          this.loading = false;
          this.messageService.setMessage('Group successfully updated!');
          this.router.navigateByUrl('admin/farmers/group/list');
        },
        (err) => {
          this.loading = false;
          this.errors = err.error || err.errors ;
        }
      );
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
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

  selectAllMembers(isChecked: boolean) {
    if (isChecked) {
      this.groupMembers.forEach((item) => {
        item.selected = true;
      });
    } else {
      this.groupMembers.forEach((item) => {
        item.selected = false;
      });
    }
    this.allMembersSelected = isChecked;
  }

  selectMember(isChecked: boolean, i: number) {
    this.groupMembers[i].selected = true;
    if (!isChecked) {
      this.allMembersSelected = isChecked;
    }
  }

  notInGroupMembers(i: number) {
    const index = this.groupMembers.findIndex(el => el.userInfo._id
      === this.searchResults[i].userInfo._id);
    if (index !== -1) {
      this.searchResults[i].selected = false;
    }
    return index === -1;
  }

  addMembersToGroup() {
    this.searchResults.forEach((item) => {
      if (item.selected) {
        item.selected = false;
        item.leaderName = item.userInfo.groupName ? item.userInfo.groupName : item.userInfo.surname + ' ' + item.userInfo.foreName;
        item.phone_number = item.userInfo.phone_number;
        this.groupMembers.push(JSON.parse(JSON.stringify(item)));
      }
    });
  }

  removeMembersToGroup() {
    this.groupMembers.forEach((item) => {
      if (item.selected) {
        this.groupMembers = this.groupMembers.filter(el => el.userInfo._id !== item.userInfo._id);
      }
    });
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
          this.addContacts();
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
    this.editForm.controls.location.get('prov_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangeProvince(this.editForm, value);
      }
    );
    this.editForm.controls.location.get('dist_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangDistrict(this.editForm, value);
      }
    );
    this.editForm.controls.location.get('sect_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangSector(this.editForm, value);
      }
    );
    this.editForm.controls.location.get('cell_id'.toString()).valueChanges.subscribe(
      (value) => {
        this.locationChangCell(this.editForm, value);
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
              .get('village_id'.toString()).setValue('', { emitEvent: false });
          });
        } else {
          this.basicCoveredCells = null;
          this.basicCoveredVillages = null;
          this.filterForm.controls.searchByLocation
            .get('cell_id'.toString()).setValue('', { emitEvent: false });
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', { emitEvent: false });
        }
      });
    this.filterForm.controls.searchOption
      .valueChanges.subscribe((value) => {
        if (value !== '' && value === 'location') {
          this.searchByLocation = true;
          this.filterForm.controls.searchByTerm.get('term').setValue('');
        } else {
          this.filterForm.controls.searchByLocation
            .get('sect_id'.toString()).setValue('', { emitEvent: false });
          this.filterForm.controls.searchByLocation
            .get('cell_id'.toString()).setValue('', { emitEvent: false });
          this.filterForm.controls.searchByLocation
            .get('village_id'.toString()).setValue('', { emitEvent: false });
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
              .get('village_id'.toString()).setValue('', { emitEvent: false });

          });
        }
      });
  }
}
