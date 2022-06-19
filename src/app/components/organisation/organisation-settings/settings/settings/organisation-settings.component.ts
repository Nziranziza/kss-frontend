import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BasicComponent} from '../../../../../core';
import {PaymentService} from '../../../../../core/services/payment.service';
import {HelperService} from '../../../../../core';
import {CoffeeTypeService, ConfirmDialogService, OrganisationService} from '../../../../../core';
import {ActivatedRoute} from '@angular/router';
import {EditPaymentChannelComponent} from '../edit-payment-channel/edit-payment-channel.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditCertificateComponent} from '../edit-certificate/edit-certificate.component';

@Component({
  selector: 'app-organisation-settings-channel',
  templateUrl: './organisation-settings.component.html',
  styleUrls: ['./organisation-settings.component.css']
})
export class OrganisationSettingsComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private modal: NgbModal,
              private paymentService: PaymentService, private  confirmDialogService: ConfirmDialogService,
              private route: ActivatedRoute, private coffeeTypeService: CoffeeTypeService,
              private helper: HelperService, private organisationService: OrganisationService) {
    super();
  }

  addPaymentChannelForm: FormGroup;
  addCertificateForm: FormGroup;
  coffeeTypes = [];
  paymentChannels: any;
  channels: any;
  organisationId: string;
  orgPaymentChannels: any;
  banks: any;
  fileError: string;
  isFileSaved: boolean;
  cardFileBase64: string;
  certificates: any;
  isImage: boolean;
  @ViewChild('fileInput')
  fileInputVariable: ElementRef;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.addPaymentChannelForm = this.formBuilder.group({
      paymentChannels: new FormArray([])
    });
    this.addCertificateForm = this.formBuilder.group({
      certificateName: ['', Validators.required],
      coffeeType: ['', Validators.required],
      issuedDate: ['', Validators.required],
      issuedBy: ['', Validators.required],
      file: ['', Validators.required],
      expirationDate: ['']
    });
    this.getAllCoffeeTypes();
    this.getBanksList();
    this.getPaymentChannels();
    this.addPaymentChannel();
    this.getOrgPaymentChannels();
    this.getCertificates();
  }

  onSubmitPaymentChannel() {
    if (this.addPaymentChannelForm.valid) {
      const paymentChannel = this.addPaymentChannelForm.value;
      paymentChannel['org_id'.toString()] = this.organisationId;
      paymentChannel['channels'.toString()] = paymentChannel.paymentChannels;
      delete paymentChannel.paymentChannels;
      paymentChannel.channels.map((channel) => {
        channel.channelId = +channel.channelId;
      });
      this.organisationService.orgAddPaymentChannels(paymentChannel)
        .subscribe((data) => {
            this.setMessage(data.message);
            this.getOrgPaymentChannels();
          },
          (err) => {
            this.setError(err.errors);
          });
    } else {
      this.setError(['missing required data']);
    }
  }

  editOrgPaymentChannel(channel: any) {
    const modalRef = this.modal.open(EditPaymentChannelComponent, {size: 'lg'});
    modalRef.componentInstance.channel = channel;
    modalRef.result.finally(() => {
      this.getOrgPaymentChannels();
    });
  }

  editCertificate(id: string) {
    const modalRef = this.modal.open(EditCertificateComponent, {size: 'lg'});
    modalRef.componentInstance.id = id;
    modalRef.result.finally(() => {
      this.getCertificates();
    });
  }

  get formPaymentChannel() {
    return this.addPaymentChannelForm.controls.paymentChannels as FormArray;
  }

  onChangePaymentChannel(index: number) {
    const value = this.formPaymentChannel.value[index];
    this.formPaymentChannel.value.forEach((el, i) => {
      if ((value.channelId === el.channelId) && (this.formPaymentChannel.value.length > 1) && (i !== index)) {
        this.removePaymentChannel(index);
      }
    });
    if (+value.channelId === 5) {
      this.getPaymentChannelFormGroup(index).controls.bankName.enable();
    } else {
      this.getPaymentChannelFormGroup(index).controls.bankName.disable();
    }
  }

  addPaymentChannel() {
    (this.addPaymentChannelForm.controls.paymentChannels as FormArray).push(this.createPaymentChannel());
  }

  removePaymentChannel(index: number) {
    (this.addPaymentChannelForm.controls.paymentChannels as FormArray).removeAt(index);
  }

  getPaymentChannelFormGroup(index): FormGroup {
    this.paymentChannels = this.addPaymentChannelForm.controls.paymentChannels as FormArray;
    return this.paymentChannels.controls[index] as FormGroup;
  }

  createPaymentChannel(): FormGroup {
    return this.formBuilder.group({
      channelId: ['', Validators.required],
      subscriptionNumber: ['', Validators.required],
      bankName: [{value: '', disabled: true}, Validators.required]
    });
  }

  getPaymentChannels() {
    this.paymentService.listChannelsConstants().subscribe((data) => {
      this.channels = Object.keys(data.content).map(key => {
        return {channel: key, _id: data.content[key]};
      });
      this.channels = this.helper.getOrgPossiblePaymentChannels(this.channels);
    });
  }

  getOrgPaymentChannels() {
    this.organisationService.orgPaymentChannels(this.organisationId).subscribe((data) => {
      this.orgPaymentChannels = data.content;
    });
  }

  getCertificates() {
    this.organisationService.orgCertificates(this.organisationId).subscribe((data) => {
      this.certificates = data.content;
    });
  }

  fileChangeEvent(fileInput: any) {
    this.fileError = null;
    this.isImage = false;
    if (fileInput.target.files && fileInput.target.files[0]) {
      const maxSize = 4194304;
      const allowedTypes = [
        'image/jpg',
        'image/jpeg',
        'image/png'
      ];

      if (fileInput.target.files[0].size > maxSize) {
        this.fileError =
          'Maximum size allowed is ' + '4Mb';
        this.removeFile();
        return false;
      }

      if (!allowedTypes.includes(fileInput.target.files[0].type)) {
        this.fileError = 'Only ( JPG | PNG ) types are allowed';
        this.removeFile();
        return false;
      } else {
        this.isImage = true;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        this.cardFileBase64 = e.target.result;
        this.isFileSaved = true;
      };
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  removeFile() {
    this.cardFileBase64 = null;
    this.isFileSaved = false;
    this.fileInputVariable.nativeElement.value = '';
  }

  onSubmitCertificate() {
    const certificate = this.addCertificateForm.value;
    certificate.org_id = this.organisationId;
    certificate.file = this.cardFileBase64;
    this.helper.cleanObject(certificate);
    this.organisationService.registerCertificate(certificate)
      .subscribe(() => {
        this.setMessage('certificate successful recorded!');
        this.getCertificates();
        this.addCertificateForm.reset();
        this.removeFile();
      }, (error) => {
        this.setError(error.errors);
      });
  }

  deleteCertificate(id: string): void {
    this.confirmDialogService.
    openConfirmDialog('Are you sure you want to delete this certificate? Action can not be undone')
      .afterClosed().subscribe(
      res => {
        if (res) {
          this.organisationService.deleteCertificate(id)
            .subscribe(() => {
                this.setMessage('Certificate successful removed!');
                this.getCertificates();
              },
              (err) => {
                this.setError(err.errors);
              });
        }
      });
  }

  getAllCoffeeTypes(): void {
    this.coffeeTypeService.all().subscribe((data) => {
      data.content.map((item) => {
        if (item.level === 'CWS') {
          item.category.map((el) => {
            this.coffeeTypes.push(el);
          });
        }
      });
    });
  }

  getBanksList() {
    this.paymentService.listBanks().subscribe((data) => {
      this.banks = data.content;
    });
  }

  changeChannelStatus(channel: any, action: string) {
    const chl = {
      channelId: channel.channelId,
      subscriptionNumber: channel.subscriptionNumber,
      org_id: this.organisationId
    };
    chl['org_id'.toString()] = this.organisationId;
    if (action === 'enable') {
      chl['action'.toString()] = 'enable';
    } else {
      chl['action'.toString()] = 'disable';
    }

    this.organisationService.orgEditPaymentChannel(chl).subscribe(() => {
        this.getOrgPaymentChannels();
        this.setMessage('channel status successfully updated!');
      },
      (err) => {
        this.setError(err.errors);
      });
  }
}
