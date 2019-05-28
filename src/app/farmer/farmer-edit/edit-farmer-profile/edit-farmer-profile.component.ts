import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../core/services/user.service';
import {HelperService} from '../../../core/helpers';
import {FarmerService} from '../../../core/services';

@Component({
  selector: 'app-edit-farmer-profile',
  templateUrl: './edit-farmer-profile.component.html',
  styleUrls: ['./edit-farmer-profile.component.css']
})
export class EditFarmerProfileComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() farmer;
  editFarmerProfileForm: FormGroup;
  userNIDInfo = {};
  isGroup = false;
  errors: string[];
  message: string;
  submit = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder, private userService: UserService,
    private helper: HelperService, private farmerService: FarmerService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editFarmerProfileForm = this.formBuilder.group({
      foreName: [''],
      surname: [''],
      groupName: [''],
      email: [''],
      phone_number: ['', Validators.required],
      sex: [''],
      NID: ['', [Validators.required, Validators.minLength(16)]],
      type: ['', Validators.required],
      groupContactPerson: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        phone: ['']
      })
    });
  }

  onInputNID(nid: string) {
    this.verifyNID(nid);
  }

  verifyNID(nid: string) {
    if (nid.length >= 16) {
      this.userService.verifyNID(nid).subscribe(data => {
          this.userNIDInfo['foreName'.toString()] = data.content.foreName;
          this.userNIDInfo['surname'.toString()] = data.content.surname;
          this.userNIDInfo['sex'.toString()] = data.content.sex.toLowerCase();
          this.editFarmerProfileForm.patchValue(this.userNIDInfo);
          this.submit = true;
          this.errors = [];
        },
        (err) => {
          this.submit = false;
          this.errors = ['Invalid NID'];
          this.resetNIDInfo();
        });
    } else {
      this.submit = false;
      this.resetNIDInfo();
    }
  }

  resetNIDInfo() {
    this.editFarmerProfileForm.get('foreName'.toString()).reset();
    this.editFarmerProfileForm.get('surname'.toString()).reset();
    this.editFarmerProfileForm.get('sex'.toString()).reset();
  }

  onChangeType() {
    this.editFarmerProfileForm.get('type'.toString()).valueChanges.subscribe(
      (value) => {
        if (+value === 2) {
          this.isGroup = true;
          this.submit = true;
        } else {
          this.isGroup = false;
          this.verifyNID(this.editFarmerProfileForm.get('NID'.toString()).value);
        }
      }
    );
  }
  onSubmit() {
    if (this.editFarmerProfileForm.valid) {
      this.farmerService.updateFarmerProfile(this.editFarmerProfileForm.value).subscribe(data => {

        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editFarmerProfileForm);
    }
  }
}
