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
import { Router } from '@angular/router';
import { SuccessModalComponent } from '../../../../shared';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-schedule-farm-visit',
  templateUrl: './schedule-farm-visit.component.html',
  styleUrls: [
    './schedule-farm-visit.component.css',
  ],
})
export class ScheduleFarmVisitComponent extends BasicComponent implements OnInit {
  scheduleVisit: FormGroup;
  scrollStrategy: ScrollStrategy;
  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private groupService: GroupService,
    private authenticationService: AuthenticationService,
    private gapService: GapService,
    private userService: UserService,
    private visitService: VisitService,
    private router: Router,
    private modal: NgbModal,
    private helper: HelperService,
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
  farmers: any[] = [];
  gapDropdownSettings: IDropdownSettings = {};
  viewDetailsClicked: boolean;
  farmDetails;
  farmerGroupId;
  errors: any;
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
    this.newDate.setDate(this.newDate.getDate() - 1);

    this.gapDropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'name',
      enableCheckAll: true,
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
  }

  onGapSelect(item: any) {
    const gapSelected = this.scheduleVisit.get('adoptionGap'.toString());
    if (item._id === '') {
      gapSelected.setValue(
        [
          {
            _id: '',
            name: 'Not Applied',
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
    const gapOptions = gapSelected.value.filter(
      (data) => data._id !== item._id
    );
    gapSelected.setValue(gapOptions, { emitEvent: false });
  }
  onGapSelectAll(items: any) {
    const gapSelected = this.scheduleVisit.get('adoptionGap'.toString());

    gapSelected.setValue(items.filter((e) => e._id !== ''), { emitEvent: false });
  }

  getFarms(groupName: string) {
    const data = {
      name: groupName,
      org_id: this.authenticationService.getCurrentUser().info.org_id,
    };
    this.farmList = [];
    this.farmers = [];
    this.groupService.getByName(data).subscribe((newdata) => {
      this.farmerGroupId = newdata.data._id;
      newdata.data.members.forEach((member) => {
        const newMember = member.farms.map((farm) => {
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
              selected: false,
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
    this.farmers.map((farmer) => {
      const newData = farmer.farms.filter((data) => {
        return data.selected === true;
      });
      this.selectedFarms.push(...newData);
    });
  }

  selectFarms(isChecked: boolean, item: number, i: number) {
    this.farmers[item].farms[i].selected = isChecked;
    this.selectedFarms = [];
    this.farmers.map((farmer) => {
      const newData = farmer.farms.filter((data) => {
        return data.selected === true;
      });
      this.selectedFarms.push(...newData);
    });
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
  }


  getGaps(): void {
    this.loading = true;
    this.gapService.all().subscribe((data) => {
      const newData: any[] = [
        {
          _id: '',
          name: 'Not Applied',
        },
      ];
      data.data.forEach((newdata) => {
        newData.push({ _id: newdata._id, name: newdata.gap_name });
      });
      this.gaps = newData;
      this.loading = false;
    });
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
    if (this.scheduleVisit.valid && this.selectedFarms.length > 0) {
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
        farms: this.selectedFarms.map((newdata) => {
          return {
            farmId: newdata.farm._id,
            owner: newdata.owner,
          };
        }),
        description: dataValues.description,
        org_id: this.authenticationService.getCurrentUser().info.org_id,
        visitor: dataValues.agronomist,
        groupId: this.farmerGroupId,
        observation: 'observation',
        date: dataValues.date.visitDate,
        expectedDuration: {
          from: this.formatTime(dataValues.startTime),
          to: this.formatTime(dataValues.endTime),
        },
      };
      if (adoptionGap.length > 0) {
        data.gaps = adoptionGap;
      }
      this.visitService.create(data).subscribe(
        (newdata) => {
          this.success(newdata.data.description, newdata.data._id);
          this.loading = false;
        },
        (err) => {
          this.error('farm visit');
          this.loading = false;
        }
      );
    } else {
      this.errors = this.helper.getFormValidationErrors(this.scheduleVisit);
    }
  }

  success(name, id) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
    });
    modalRef.componentInstance.message = 'has been added';
    modalRef.componentInstance.title = 'Thank you farm visit schedule';
    modalRef.componentInstance.name = name;
    modalRef.componentInstance.messageEnabled = true;
    modalRef.componentInstance.smsId = id;
    modalRef.componentInstance.serviceName = 'visit';
    modalRef.result.finally(() => {
      this.router.navigateByUrl('admin/farm/visit/list');
    });
  }

  error(name) {
    const modalRef = this.modal.open(SuccessModalComponent, {
      ariaLabelledBy: 'modal-basic-title',
    });
    modalRef.componentInstance.message = 'failed to be scheduled';
    modalRef.componentInstance.title =
      'check the information again and try again';
    modalRef.componentInstance.name = name;
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
    let minutes: string = currentDate.getMinutes().toString();
    hours = hours % 24;
    hours = hours ? hours : 24; // the hour '0' should be '12'
    minutes = parseInt(minutes, 10) < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes;
    return strTime;
  }
}
