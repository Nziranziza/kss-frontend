import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {AuthenticationService, FarmerService} from '../../../core/services';
import {isUndefined} from 'util';
import {PaymentService} from '../../../core/services/payment.service';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-edit-farmer-profile',
  templateUrl: './edit-farmer-profile.component.html',
  styleUrls: ['./edit-farmer-profile.component.css']
})
export class EditFarmerProfileComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() farmer;
  editFarmerProfileForm: FormGroup;
  addPaymentChannelsForm: FormGroup;
  isGroup = false;
  loading = false;
  submit = true;
  invalidId = false;
  paymentChannels: any;
  channels: any;
  coffeeFarmerPaymentChannels: any;


  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private authenticationService: AuthenticationService,
    private injector: Injector, private formBuilder: FormBuilder, private userService: UserService,
    private helper: HelperService, private farmerService: FarmerService, private paymentService: PaymentService) {

    super();
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

    this.addPaymentChannelsForm = this.formBuilder.group({
      paymentChannels: new FormArray([])
    });
    this.onChangeType();
    this.farmer.sex = this.farmer.sex.toLowerCase();
    if (!isUndefined(this.farmer.type)) {
      this.farmer.type = this.farmer.type.toString();
    }
    this.editFarmerProfileForm.patchValue(this.farmer);
    this.getPaymentChannels();
    this.addPaymentChannel();
    this.getCoffeeFarmerPaymentChannels();
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

  onAddChannel() {
    if (this.addPaymentChannelsForm.valid) {
      const paymentChannel = this.addPaymentChannelsForm.value;
      paymentChannel['userId'.toString()] = this.farmer._id;
      paymentChannel.paymentChannels.map((channel) => {
        channel.paymentChannel = +channel.paymentChannel;
      });
      this.farmerService.addPaymentChannels(paymentChannel)
        .subscribe((data) => {
            this.setMessage(data.message);
            this.getCoffeeFarmerPaymentChannels();
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(['missing required data']);
    }
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
      if ((+body.type === 1 && +this.farmer.type === 1) || isUndefined(this.farmer.type)) {
        delete body.NID;
      }
      this.helper.cleanObject(body);
      this.farmerService.updateFarmerProfile(body).subscribe(() => {
          this.modal.dismiss();
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.addPaymentChannelsForm));
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

  get formPaymentChannel() {
    return this.addPaymentChannelsForm.controls.paymentChannels as FormArray;
  }

  onChangePaymentChannel(index: number) {
    const value = this.formPaymentChannel.value[index];
    this.formPaymentChannel.value.forEach((el, i) => {
      if ((value.channelId === el.channelId) && (this.formPaymentChannel.value.length > 1) && (i !== index)) {
        this.removePaymentChannel(index);
      }
    });
  }

  addPaymentChannel() {
    (this.addPaymentChannelsForm.controls.paymentChannels as FormArray).push(this.createPaymentChannel());
  }

  removePaymentChannel(index: number) {
    (this.addPaymentChannelsForm.controls.paymentChannels as FormArray).removeAt(index);
  }

  getPaymenntChannelFormGroup(index): FormGroup {
    this.paymentChannels = this.addPaymentChannelsForm.controls.paymentChannels as FormArray;
    return this.paymentChannels.controls[index] as FormGroup;
  }

  createPaymentChannel(): FormGroup {
    return this.formBuilder.group({
      paymentChannel: ['', Validators.required],
      subscriptionCode: ['', Validators.required]
    });
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.channels = Object.keys(data.content).map(key => {
        return {channel: key, _id: data.content[key]};
      });
      this.channels = this.helper.getFarmersPossiblePaymentChannels(this.channels);
    });
  }

  getPaymentChannelName(id: number) {
    const result = this.channels.find((channel) => {
      return channel._id === id;
    });
    return result.channel;
  }

  getCoffeeFarmerPaymentChannels() {
    this.userService.get(this.farmer._id).subscribe((data) => {
      this.coffeeFarmerPaymentChannels = data.content.paymentChannels;
    });
  }
}
