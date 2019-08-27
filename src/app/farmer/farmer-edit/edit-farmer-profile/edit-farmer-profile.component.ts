import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, FarmerService} from '../../../core/services';
import {isUndefined} from 'util';

@Component({
  selector: 'app-edit-farmer-profile',
  templateUrl: './edit-farmer-profile.component.html',
  styleUrls: ['./edit-farmer-profile.component.css']
})
export class EditFarmerProfileComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() farmer;
  editFarmerProfileForm: FormGroup;
  isGroup = false;
  errors: any;
  message: string;
  loading = false;
  submit = true;
  invalidId = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private authenticationService: AuthenticationService,
    private injector: Injector, private formBuilder: FormBuilder, private userService: UserService,
    private helper: HelperService, private farmerService: FarmerService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    this.editFarmerProfileForm = this.formBuilder.group({
      phone_number: [''],
      groupName: [''],
      NID: [''],
      foreName: [''],
      surname: [''],
      sex: [''],
      type: ['', Validators.required],
      groupContactPerson: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        phone: ['']
      })
    });
    this.onChangeType();
    this.farmer.sex = this.farmer.sex.toLowerCase();
    if (!isUndefined(this.farmer.type)) {
      this.farmer.type = this.farmer.type.toString();
    }
    this.editFarmerProfileForm.patchValue(this.farmer);
  }

  onChangeType() {
    this.editFarmerProfileForm.get('type'.toString()).valueChanges.subscribe(
      (value) => {
        if (+value === 2) {
          this.isGroup = true;
          this.submit = true;
        } else {
          this.isGroup = false;
        }
      }
    );
  }

  onSubmit() {
    if (this.editFarmerProfileForm.valid) {
      const body = JSON.parse(JSON.stringify(this.editFarmerProfileForm.value));
      body['userId'.toString()] = this.farmer._id;
      if (+body.type === 1) {
        delete body.groupName;
        delete body.groupContactPerson;
      }
      if (+body.type === 2) {
        delete body.phone_number;
        delete body.NID;
        delete body.foreName;
        delete body.surname;
        delete body.sex;
      }
      console.log(+this.farmer.type);
      if ((+body.type === 1 && +this.farmer.type === 1) || isUndefined(this.farmer.type)) {
        delete body.NID;
      }
      this.farmerService.updateFarmerProfile(body).subscribe(() => {
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editFarmerProfileForm);

    }
  }

  verifyNid(nid: string) {
    if (nid !== this.farmer.NID) {
      if (nid.length >= 16) {
        this.loading = true;
        this.submit = false;
        this.userService.verifyNID(nid).subscribe(data => {
            const info = {
              foreName: data.content.foreName,
              surname: data.content.surname,
              sex: data.content.sex.toLowerCase()
            };
            this.editFarmerProfileForm.patchValue(info);
            this.submit = true;
            this.loading = false;
            this.invalidId = false;
          },
          () => {
            this.submit = false;
            this.loading = false;
            if (!this.isGroup) {
              this.invalidId = true;
            }
          });
      } else {
        this.submit = false;
      }
    } else {
      this.submit = true;
    }
  }
}
