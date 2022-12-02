import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AuthenticationService,
  BasicComponent,
  GapService,
  GroupService,
  HelperService,
  UserService,
  VisitService,
} from 'src/app/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute, Router } from '@angular/router';
import { SuccessModalComponent } from 'src/app/shared';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';

@Component({
  selector: 'app-edit-farm-visit',
  templateUrl: './edit-farm-visit.component.html',
  styleUrls: [
    '../../schedules/training-scheduling-create/training-scheduling-create.component.css',
  ],
})
export class EditFarmVisitComponent extends BasicComponent implements OnInit {
  scheduleVisit: FormGroup;
  scrollStrategy: ScrollStrategy;
  errors: any;
  successDetails: any;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private groupService: GroupService,
    private authenticationService: AuthenticationService,
    private gapService: GapService,
    private userService: UserService,
    private visitService: VisitService,
    private router: Router,
    private route: ActivatedRoute,
    private helper: HelperService,
    private modal: NgbModal,
    private readonly sso: ScrollStrategyOptions
  ) {
    super();
    this.scrollStrategy = this.sso.noop();
  }
  loading = false;
  farmerGroups: any[] = [];
  farmList: any[] = [];
  selectedFarm: any[] = [];
  allTraineesSelected: boolean;
  gaps: any[] = [];
  agronomist: any[] = [];
  savedFarmList: any[] = [];
  farmers: any[] = [];
  gapDropdownSettings: IDropdownSettings = {};
  viewDetailsClicked: boolean;
  farmDetails;
  farmerGroupId;
  id: string;
  visits: any[] = [];
  selectedFarms: any[] = [];
  formatedStartDate: string;
  formatedEndDate: string;
  newDate: Date = new Date();
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  // @ts-ignore
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  config: any;
  allSelected = false;


  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params['id'.toString()];
    });
    this.newDate.setDate(this.newDate.getDate() - 1);
    this.scheduleVisit = this.formBuilder.group({
      farmerGroup: ['', Validators.required],
      agronomist: ['', Validators.required],
      description: ['', Validators.required],
      adoptionGap: ['', Validators.required],
      status: [''],
      date: this.formBuilder.group({
        visitDate: ['', Validators.required],
      }),
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
    this.getVisits();
    this.gapDropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'gap_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 6,
      allowSearchFilter: true,
    };
    this.getFarmerGroup();
    this.getGaps();
    this.getAgronomists();
    this.onChanges();
  }
  getVisits() {
    this.visitService.one(this.id).subscribe((data) => {
      this.visits = data.data;
      this.savedFarmList = data.data.farms;
      this.scheduleVisit.controls.startTime.setValue(
        new Date(data.data.date.split('T')[0] +
          'T' +
          (parseInt(data.data.expectedDuration.from.split(':')[0], 10) - 2).toString() + ':'
          + data.data.expectedDuration.from.split(':')[1] +
          ':00.000Z')
      );
      this.scheduleVisit.controls.endTime.setValue(
        new Date(data.data.date.split('T')[0] +
          'T' +
          (parseInt(data.data.expectedDuration.to.split(':')[0], 10) - 2).toString() + ':' + data.data.expectedDuration.to.split(':')[1] +
          ':00.000Z')
      );
      this.scheduleVisit.controls.farmerGroup.setValue(
        data.data.groupId.groupName,
        { emitEvent: false }
      );
      this.getFarms(data.data.groupId.groupName);
      this.scheduleVisit.controls.adoptionGap.setValue(data.data.gaps);
      this.scheduleVisit.controls.description.setValue(data.data.description);
      this.scheduleVisit.controls.agronomist.setValue(data.data.visitor.userId);
      this.scheduleVisit.controls.date
        .get('visitDate')
        .setValue(data.data.date);
    });
  }

  getFarmerGroup() {
    this.loading = true;
    this.groupService
      .list({
        reference: this.authenticationService.getCurrentUser().info.org_id,
      })
      .subscribe((data) => {
        this.farmerGroups = data.data;
        this.loading = false;
      });
    this.loading = false;
  }

  onGapSelect(item: any) {
    const gapSelected = this.scheduleVisit.get('adoptionGap'.toString());
    if (item._id === '') {
      gapSelected.setValue(
        [
          {
            _id: '',
            gap_name: 'Not Applied',
          },
        ],
        { emitEvent: false }
      );
    } else {
      gapSelected.setValue(gapSelected.value.filter((e) => e._id !== ''));
    }
  }
  onDeGapSelect(item: any) {
    const gapSelected = this.scheduleVisit.get('adoptionGap'.toString());
    const gapOptions = gapSelected.value.filter((data) => data._id !== item._id);
    gapSelected.setValue(gapOptions, { emitEvent: false });
  }
  onGapSelectAll(items: any) {
    const gapSelected = this.scheduleVisit.get('adoptionGap'.toString());
    gapSelected.setValue(items, { emitEvent: false });
  }

  checkIfExit(id: string) {
    let result = false;
    this.savedFarmList.forEach((farms) => {
      if (farms.farmId === id) {
        result = true;
        return;
      }
    });
    return result;
  }
  getFarms(groupName: string) {
    const newdata = {
      name: groupName,
      org_id: this.authenticationService.getCurrentUser().info.org_id,
    };
    this.farmList = [];
    this.farmers = [];

    this.groupService.getByName(newdata).subscribe((data) => {
      this.farmerGroupId = data.data._id;
      data.data.members.forEach((member) => {
        const newMember =
          member.farms.map((farm) => {
            const newFarm = farm.requestInfo.map((info) => {
              return {
                farm: info,
                upi: info.upiNumber,
                location: info.location,
                trees: info.numberOfTrees,
                farmer: member.firstName
                  ? member.firstName + ' ' + member.lastName
                  : member.groupContactPersonNames,
                owner: member.userId,
                selected: this.checkIfExit(info._id),
              };
            });
            return {
              farmer: member.firstName
                ? member.firstName + ' ' + member.lastName
                : member.groupContactPersonNames,
              owner: member.userId,
              farmSelected: false,
              farms: newFarm
            };
          });
        this.farmers.push(newMember[0]);
      });
      this.config = {
        itemsPerPage: 2,
        currentPage: 1,
        totalItems: this.farmers.length,
      };
      this.dtTrigger.next();
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      order: [],
    };
  }

  selectAllFarmer(isChecked: boolean) {
    this.allSelected = isChecked;
    this.farmers.map((farmer) => {
      farmer.farmSelected = isChecked;
      farmer.farms.forEach((farm) => {
        farm.selected = isChecked;
      });
    });
    this.selectedFarmersList();
  }

  selectedFarmersList() {
    this.selectedFarms = [];
    this.farmers.map((farmer) => {
      const newData = farmer.farms.filter((data) => {
        return data.selected === true;
      });
      this.selectedFarms.push(...newData);
    });
  }

  selectFarmer(isChecked: boolean, i: number) {
    this.farmers[i].farmSelected = isChecked;
    this.farmers[i].farms.forEach((farm) => {
      farm.selected = isChecked;
    });
    this.selectedFarmersList();
  }

  selectFarms(isChecked: boolean, item: number, i: number) {
    this.farmers[item].farms[i].selected = isChecked;
    this.selectedFarmersList();
  }

  expandFarmModal(i: number) {
    this.farmers[i].openDialog = !this.farmers[i].openDialog;
  }

  viewDetails(i: number) {
    this.farmDetails = this.farmList[i].farm;
    this.viewDetailsClicked = true;
  }

  getAgronomists() {
    this.loading = true;
    this.userService
      .allAgronomist({
        org_id: this.authenticationService.getCurrentUser().info.org_id,
      })
      .subscribe((data) => {
        this.agronomist = data.data;
        this.loading = false;
      });
    this.loading = false;
  }

  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      const newData: any[] = [
        {
          _id: '',
          gap_name: 'Not Applied',
        },
      ];
      data.data.forEach((newdata) => {
        newData.push({ _id: newdata._id, gap_name: newdata.gap_name });
      });
      this.gaps = newData;
      this.loading = false;
    });
    this.loading = false;
  }

  onChanges() {
    this.scheduleVisit
      .get('farmerGroup'.toString())
      .valueChanges.subscribe((value) => {
        this.getFarms(value);
      });
  }

  open(content) {
    this.scheduleVisit.markAllAsTouched();
    this.selectedFarmersList();
    if (this.scheduleVisit.valid) {
      this.formatedStartDate =
        this.formatDate(
          this.scheduleVisit.controls.date.get('visitDate'.toString()).value
        ).split('T')[0] +
        ' ' +
        this.formatTime(this.scheduleVisit.get('startTime'.toString()).value);
      this.formatedEndDate =
        this.formatDate(
          this.scheduleVisit.controls.date.get('visitDate'.toString()).value
        ).split('T')[0] +
        ' ' +
        this.formatTime(this.scheduleVisit.get('endTime'.toString()).value);
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.scheduleVisit);
    }
  }

  onSubmit() {
    if (this.scheduleVisit.valid) {
      this.loading = true;
      const dataValues = JSON.parse(JSON.stringify(this.scheduleVisit.value));
      const adoptionGap = [];
      dataValues.adoptionGap.forEach((adoption) => {
        if (adoption._id !== '') {
          adoptionGap.push(adoption._id);
        }
      });
      const data: any = {
        date: dataValues.date.visitDate,
        description: dataValues.description,
        farms: this.selectedFarms.map((newdata) => {
          return {
            farmId: newdata.farm._id,
            owner: newdata.owner,
          };
        }),
        org_id: this.authenticationService.getCurrentUser().info.org_id,
        visitor: dataValues.agronomist,
        groupId: this.farmerGroupId,
        observation: 'observation',
        expectedDuration: {
          from: this.formatTime(dataValues.startTime),
          to: this.formatTime(dataValues.endTime),
        },
      };
      adoptionGap.length > 0 ? data.gaps = adoptionGap : data.gaps = [];
      this.visitService.edit(this.id, data).subscribe(
        (newdata) => {
          this.successDetails = newdata.data;
          this.success(newdata.data.description, newdata.data._id);
          this.loading = false;
        },
        (err) => {
          this.errors = err.errors;
          this.loading = false;
        }
      );
    } else {
      this.errors = this.helper.getFormValidationErrors(this.scheduleVisit);
      this.loading = false;
    }
  }

  success(name, id) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
    });
    modalRef.componentInstance.message = 'has been edited successfully';
    modalRef.componentInstance.title = 'Thank you farm visit schedule';
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.messageEnabled = true;
    modalRef.componentInstance.smsId = id;
    modalRef.componentInstance.serviceName = 'visit';
    modalRef.result.finally(() => {
      this.router.navigateByUrl('admin/farm/visit/list');
    });
  }

  formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  formatTime(date) {
    const currentDate = new Date(date);
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    hours = hours % 24;
    hours = hours ? hours : 24; // the hour '0' should be '12'
    minutes = minutes < 10 ? 0 + minutes : minutes;
    const strTime = hours + ':' + minutes;
    return strTime;
  }
}
