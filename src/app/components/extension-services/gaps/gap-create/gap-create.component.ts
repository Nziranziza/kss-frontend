import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  AuthenticationService,
  Gap,
  OrganisationService,
} from '../../../../core';
import { MessageService } from '../../../../core';
import { HelperService } from '../../../../core';
import { AuthorisationService } from '../../../../core';
import { BasicComponent } from '../../../../core';

@Component({
  selector: 'app-gap-create',
  templateUrl: './gap-create.component.html',
  styleUrls: ['./gap-create.component.css'],
})
export class GapCreateComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  createForm: FormGroup;
  gap: Gap;
  approachs = [
    { id: 'text_input', name: 'text_input' },
    { id: 'percentage_input', name: 'percentage_input' },
    { id: 'multiple_choice', name: 'multiple_choice' },
  ];
  options = [];

  adoptionOptionsVisible = false;
  farmer: any;
  createFromPending = false;
  isGroup = false;
  id: string;
  submit = false;
  loading = false;
  invalidId = false;
  currentSeason: any;
  isUserCWSOfficer = false;
  isUserDistrictCashCrop = false;
  isUserSiteManager = false;
  user: any;
  site: any;
  org: any;
  disableProvId = false;
  disableDistId = false;
  provinceValue = '';
  districtValue = '';
  sectorValue = '';
  cellValue = '';
  villageValue = '';
  paymentChannels: any;
  channels: any;

  public requestList: FormArray;

  constructor(
    private formBuilder: FormBuilder,
    private organisationService: OrganisationService,
    private authenticationService: AuthenticationService,
    private authorisationService: AuthorisationService,
    private messageService: MessageService,
    private helperService: HelperService
  ) {
    super();
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      name: [''],
      description: [''],
      questions: new FormArray([]),
    });
    this.addQuestion();
    this.currentSeason = this.authenticationService.getCurrentSeason();
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
    this.isUserDistrictCashCrop =
      this.authorisationService.isDistrictCashCropOfficer();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.user = this.authenticationService.getCurrentUser();

    this.organisationService
      .get(this.authenticationService.getCurrentUser().info.org_id)
      .subscribe((data) => {
        this.org = data.content;
      });

    this.initial();
    this.setMessage(this.messageService.getMessage());
  }

  onSubmit() {
    if (this.createForm.valid) {
      if (this.createFromPending) {
        const temp = this.createForm.getRawValue();
        const farmer = {};
        farmer['fertilizer_need'.toString()] = temp.requests[0].fertilizer_need;
        farmer['fertilizer_allocate'.toString()] =
          temp.requests[0].fertilizer_allocate;
        farmer['location'.toString()] = temp.requests[0].location;
        farmer['numberOfTrees'.toString()] = temp.requests[0].numberOfTrees;
        farmer['_id'.toString()] = this.id;
        farmer['created_by'.toString()] =
          this.authenticationService.getCurrentUser().info._id;
        farmer['type'.toString()] = temp.type;
        farmer['phone_number'.toString()] = temp.phone_number;
        if (!this.isGroup) {
          farmer['surname'.toString()] = temp.surname;
          farmer['foreName'.toString()] = temp.foreName;
          farmer['sex'.toString()] = temp.sex;
          farmer['NID'.toString()] = temp.NID;
          farmer['location'.toString()] = temp.location;
          farmer['familySize'.toString()] = temp.familySize;
        } else {
          farmer['groupName'.toString()] = temp.groupName;
          farmer['groupContactPerson'.toString()] = temp.groupContactPerson;
        }
        this.helperService.cleanObject(farmer);
      } else {
        const temp = this.createForm.getRawValue();
        const farmer = {
          requestInfo: [],
        };
        farmer['_id'.toString()] = this.id;
        farmer['type'.toString()] = temp.type;
        farmer['phone_number'.toString()] = temp.phone_number;
        farmer['created_by'.toString()] =
          this.authenticationService.getCurrentUser().info._id;
        if (!this.isGroup) {
          farmer['surname'.toString()] = temp.surname;
          farmer['foreName'.toString()] = temp.foreName;
          farmer['sex'.toString()] = temp.sex;
          farmer['NID'.toString()] = temp.NID;
          farmer['location'.toString()] = temp.location;
          farmer['familySize'.toString()] = temp.familySize;
        } else {
          farmer['groupName'.toString()] = temp.groupName;
          farmer['groupContactPerson'.toString()] = temp.groupContactPerson;
        }
        farmer['requestInfo'.toString()] = temp.requests;
        this.helperService.cleanObject(farmer);
        farmer.requestInfo.map((item) => {
          item['fertilizer_need'.toString()] =
            +item['numberOfTrees'.toString()] *
            this.currentSeason.seasonParams.fertilizerKgPerTree;
          return this.helperService.cleanObject(item);
        });
      }
    } else {
      if (
        this.helperService.getFormValidationErrors(this.createForm).length > 0
      ) {
        this.setError(
          this.helperService.getFormValidationErrors(this.createForm)
        );
      }
      if (this.createForm.get('requests').invalid) {
        this.setError('Missing required land(s) information');
      }
    }
  }

  createRequest(): FormGroup {
    return this.formBuilder.group({
      numberOfTrees: [
        '',
        [Validators.required, Validators.min(1), Validators.pattern('[0-9]*')],
      ],
      fertilizer_need: [''],
      fertilizer_allocate: [0],
      location: this.formBuilder.group({
        prov_id: [
          { value: this.provinceValue, disabled: this.disableProvId },
          Validators.required,
        ],
        dist_id: [
          { value: this.districtValue, disabled: this.disableDistId },
          Validators.required,
        ],
        sect_id: [this.sectorValue, Validators.required],
        cell_id: [this.cellValue, Validators.required],
        village_id: [this.villageValue, Validators.required],
      }),
    });
  }

  createCategory(): FormGroup {
    return this.formBuilder.group({
      question: ['Kwesh', Validators.required],
      answerType: ['Type', Validators.requiredTrue],
      answer: ['Default answer'],
    });
  }

  get formCategory() {
    return this.createForm.get('questions') as FormArray;
  }

  addQuestion() {
    (this.createForm.controls.questions as FormArray).push(
      this.createCategory()
    );
  }

  removeQuestion(index: number) {
    (this.createForm.controls.questions as FormArray).removeAt(index);
  }

  addOption(index) {
    const value = this.getQuestionsFormGroup(index).controls.answer.value;
    alert(value);
    this.options.push(value);
  }

  getQuestionsFormGroup(index): FormGroup {
    this.requestList = this.createForm.get('questions') as FormArray;
    return this.requestList.controls[index] as FormGroup;
  }

  onAdoptionMethodSelected(index) {
    const value = this.getQuestionsFormGroup(index).controls.answerType.value;
    if (value === 'multiple_choice') {
      this.adoptionOptionsVisible = true;
    }
  }

  onCancel() {
    // this.location.back();
  }

  get formPaymentChannel() {
    return this.createForm.controls.paymentChannels as FormArray;
  }

  initial() {}

  ngOnDestroy() {}
}
