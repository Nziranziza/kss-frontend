import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../core/services/user.service';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, FarmerService} from '../../../core/services';

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
  errors: string[];
  message: string;

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
      type: ['', Validators.required],
      groupContactPerson: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        phone: ['']
      })
    });
    this.onChangeType();
    this.editFarmerProfileForm.patchValue(this.farmer);
  }

  onChangeType() {
    this.editFarmerProfileForm.get('type'.toString()).valueChanges.subscribe(
      (value) => {
        if (+value === 2) {
          this.isGroup = true;
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
      delete body.type;
      this.farmerService.updateFarmerProfile(body).subscribe(() => {
          location.reload();
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editFarmerProfileForm);
    }
  }
}
