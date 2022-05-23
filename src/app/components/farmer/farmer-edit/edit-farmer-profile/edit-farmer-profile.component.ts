import {
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isPlatformBrowser } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService, UserService } from '../../../../core';
import { HelperService } from '../../../../core';
import { AuthenticationService, FarmerService } from '../../../../core';
import { isUndefined } from 'util';
import { PaymentService } from '../../../../core/services/payment.service';
import { BasicComponent } from '../../../../core';

@Component({
  selector: 'app-edit-farmer-profile',
  templateUrl: './edit-farmer-profile.component.html',
  styleUrls: ['./edit-farmer-profile.component.css'],
})
export class EditFarmerProfileComponent
  extends BasicComponent
  implements OnInit {
  modal: NgbActiveModal;
  @Input() farmer;
  editFarmerProfileForm: FormGroup;
  addPaymentChannelsForm: FormGroup;
  editPaymentChannelForm: FormGroup;
  provinces: any;
  districts: any;
  sectors: any;
  cells: any;
  villages: any;
  isGroup = false;
  loading = false;
  showEditPaymentChannelForm = false;
  invalidId = false;
  paymentChannels: any;
  selectedChannel: any;
  channels: any;
  coffeeFarmerPaymentChannels: any;
  submit = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private editPaymentChannelModal: NgbModal,
    private authenticationService: AuthenticationService,
    private injector: Injector,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private helper: HelperService,
    private locationService: LocationService,
    private farmerService: FarmerService,
    private paymentService: PaymentService
  ) {
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
        phone: [''],
      }),
      location: this.formBuilder.group({
        prov_id: [''],
        dist_id: [''],
        sect_id: [''],
        cell_id: [''],
        village_id: [''],
      }),
      familySize: [''],
      active: [''],
    });

    this.addPaymentChannelsForm = this.formBuilder.group({
      paymentChannels: new FormArray([]),
    });

    this.locationService.getProvinces().subscribe((data) => {
      this.provinces = data;
    });

    this.editPaymentChannelForm = this.formBuilder.group({
      channelId: [{ value: '', disabled: true }, Validators.required],
      subscriptionCode: ['', Validators.required],
    });
    this.onChangeType();
    if (!isUndefined(this.farmer.sex)) {
      this.farmer.sex = this.farmer.sex.toLowerCase();
    }
    if (this.farmer.location) {
      this.farmer.location.prov_id = this.farmer.location.prov_id._id;
      this.farmer.location.dist_id = this.farmer.location.dist_id._id;
      this.farmer.location.sect_id = this.farmer.location.sect_id._id;
      this.farmer.location.cell_id = this.farmer.location.cell_id._id;
      this.farmer.location.village_id = this.farmer.location.village_id._id;
    }
    if (!isUndefined(this.farmer.type)) {
      this.farmer.type = this.farmer.type.toString();
      this.editFarmerProfileForm.controls.type.setValue(this.farmer.type);
    }
    this.initial();
    this.editFarmerProfileForm.patchValue(this.farmer, { emitEvent: false });
    if (this.farmer.active) {
      this.farmer.active
        ? this.editFarmerProfileForm.get('active'.toString()).patchValue('true')
        : this.editFarmerProfileForm
            .get('active'.toString())
            .patchValue('false');
    }

    this.getPaymentChannels();
    this.addPaymentChannel();
    this.getCoffeeFarmerPaymentChannels();
    this.onChanges();
  }

  onChangeType() {
    this.editFarmerProfileForm
      .get('type'.toString())
      .valueChanges.subscribe((value) => {
        if (+value === 2) {
          this.isGroup = true;
          this.submit = true;
        } else {
          this.isGroup = false;
        }
      });
  }

  onAddChannel() {
    if (this.addPaymentChannelsForm.valid) {
      const paymentChannel = this.addPaymentChannelsForm.value;
      paymentChannel['userId'.toString()] = this.farmer._id;
      paymentChannel.paymentChannels.map((channel) => {
        channel.paymentChannel = +channel.paymentChannel;
      });
      this.farmerService.addPaymentChannels(paymentChannel).subscribe(
        (data) => {
          this.setMessage(data.message);
          this.getCoffeeFarmerPaymentChannels();
          this.addPaymentChannelsForm.reset();
        },
        (err) => {
          this.setError(err.errors);
        }
      );
    } else {
      this.setError(['missing required data']);
    }
  }
  onEditChannel() {
    if (this.editPaymentChannelForm.valid) {
      let channel: {};
      channel = this.editPaymentChannelForm.value;
      channel['channelId'.toString()] = this.selectedChannel._id;
      channel['userId'.toString()] = this.farmer._id;
      channel['action'.toString()] = 'edit';
      this.farmerService.editFarmerPaymentChannel(channel).subscribe(
        () => {
          this.setMessage('channel successfully updated!');
          this.getCoffeeFarmerPaymentChannels();
          this.showEditPaymentChannelForm = false;
        },
        (err) => {
          this.setError(err.errors);
        }
      );
    } else {
      this.setError(
        this.helper.getFormValidationErrors(this.editPaymentChannelForm)
      );
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
      if (
        (+body.type === 1 && +this.farmer.type === 1) ||
        isUndefined(this.farmer.type)
      ) {
        delete body.NID;
      }
      this.helper.cleanObject(body);
      this.farmerService.updateFarmerProfile(body).subscribe(
        () => {
          this.setMessage('Profile successfully updated!');
        },
        (err) => {
          this.setError(err.errors);
        }
      );
    } else {
      this.setError(
        this.helper.getFormValidationErrors(this.editFarmerProfileForm)
      );
    }
  }

  verifyNid(nid: string) {
    if (nid !== this.farmer.NID) {
      if (nid.length >= 16) {
        this.loading = true;
        this.submit = false;
        this.userService.verifyNID(nid).subscribe(
          (data) => {
            const info = {
              foreName: data.content.foreName,
              surname: data.content.surname,
              sex: data.content.sex.toLowerCase(),
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
          }
        );
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
      if (
        value.channelId === el.channelId &&
        this.formPaymentChannel.value.length > 1 &&
        i !== index
      ) {
        this.removePaymentChannel(index);
      }
    });
  }

  addPaymentChannel() {
    (this.addPaymentChannelsForm.controls.paymentChannels as FormArray).push(
      this.createPaymentChannel()
    );
  }

  removePaymentChannel(index: number) {
    (
      this.addPaymentChannelsForm.controls.paymentChannels as FormArray
    ).removeAt(index);
  }

  getPaymentChannelFormGroup(index): FormGroup {
    this.paymentChannels = this.addPaymentChannelsForm.controls
      .paymentChannels as FormArray;
    return this.paymentChannels.controls[index] as FormGroup;
  }

  createPaymentChannel(): FormGroup {
    return this.formBuilder.group({
      paymentChannel: ['', Validators.required],
      subscriptionCode: ['', Validators.required],
    });
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.channels = Object.keys(data.content).map((key) => {
        return { channel: key, _id: data.content[key] };
      });
      this.channels = this.helper.getFarmersPossiblePaymentChannels(
        this.channels
      );
    });
  }

  getPaymentChannelName(id: number) {
    const result = this.channels.find((channel) => {
      return channel._id === id;
    });
    if (result) {
      return result.channel;
    }
  }

  getCoffeeFarmerPaymentChannels() {
    this.userService.get(this.farmer._id).subscribe((data) => {
      this.coffeeFarmerPaymentChannels = data.content.paymentChannels;
    });
  }

  editCoffeeFarmerPaymentChannel(channel: any) {
    this.selectedChannel = {
      channelId: channel.paymentChannel,
      _id: channel._id,
      subscriptionCode: channel.subscriptionCode,
    };
    this.showEditPaymentChannelForm = true;
    this.editPaymentChannelForm.patchValue(this.selectedChannel);
  }

  deleteCoffeeFarmerPaymentChannel(channel: any) {
    const chl = {
      channelId: channel._id,
      subscriptionCode: channel.subscriptionCode,
    };
    chl['userId'.toString()] = this.farmer._id;
    chl['action'.toString()] = 'delete';
    this.farmerService.editFarmerPaymentChannel(chl).subscribe(
      () => {
        this.getCoffeeFarmerPaymentChannels();
        this.setMessage('channel status successfully deleted');
      },
      (err) => {
        this.setError(err.errors);
      }
    );
  }

  onChanges() {
    this.editFarmerProfileForm.controls.location
      .get('prov_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          this.locationService.getDistricts(value).subscribe((data) => {
            this.districts = data;
            this.sectors = null;
            this.cells = null;
            this.villages = null;
          });
        }
      });
    this.editFarmerProfileForm.controls.location
      .get('dist_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          this.locationService.getSectors(value).subscribe((data) => {
            this.sectors = data;
            this.cells = null;
            this.villages = null;
          });
        }
      });
    this.editFarmerProfileForm.controls.location
      .get('sect_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          this.locationService.getCells(value).subscribe((data) => {
            this.cells = data;
            this.villages = null;
          });
        }
      });
    this.editFarmerProfileForm.controls.location
      .get('cell_id'.toString())
      .valueChanges.subscribe((value) => {
        if (value !== '') {
          this.locationService.getVillages(value).subscribe((data) => {
            this.villages = data;
          });
        }
      });
  }

  initial() {
    if (this.farmer.location) {
      this.locationService
        .getDistricts(this.farmer.location.prov_id)
        .subscribe((districts) => {
          this.districts = districts;
        });
      this.locationService
        .getSectors(this.farmer.location.dist_id)
        .subscribe((sectors) => {
          this.sectors = sectors;
        });
      this.locationService
        .getCells(this.farmer.location.sect_id)
        .subscribe((cells) => {
          this.cells = cells;
        });
      this.locationService
        .getVillages(this.farmer.location.cell_id)
        .subscribe((villages) => {
          this.villages = villages;
        });
    }
  }
}
