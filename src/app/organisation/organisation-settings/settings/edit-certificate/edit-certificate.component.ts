import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BasicComponent} from '../../../../core/library';
import {PaymentService} from '../../../../core/services/payment.service';
import {HelperService} from '../../../../core/helpers';
import {CoffeeTypeService, OrganisationService} from '../../../../core/services';
import {ActivatedRoute} from '@angular/router';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe, isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-edit-certificate-channel',
  templateUrl: './edit-certificate.component.html',
  styleUrls: ['./edit-certificate.component.css']
})
export class EditCertificateComponent extends BasicComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,
              private paymentService: PaymentService,
              @Inject(PLATFORM_ID) private platformId: object,
              private injector: Injector,
              private datePipe: DatePipe,
              private route: ActivatedRoute, private coffeeTypeService: CoffeeTypeService,
              private helper: HelperService, private organisationService: OrganisationService) {

    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  modal: NgbActiveModal;
  editCertificateForm: FormGroup;
  coffeeTypes = [];
  organisationId: string;
  certificate: any;
  fileError: string;
  isImage: boolean;
  isFileSaved: boolean;
  cardFileBase64: string;
  @Input() id;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.editCertificateForm = this.formBuilder.group({
      certificateName: ['', Validators.required],
      coffeeType: ['', Validators.required],
      issuedDate: ['', Validators.required],
      issuedBy: ['', Validators.required],
      file: ['', Validators.required],
      expirationDate: ['', Validators.required]
    });
    this.getAllCoffeeTypes();
    this.getCertificates(this.id);
  }

  getCertificates(id: string) {
    this.organisationService.getCertificate(id).subscribe((data) => {
      this.certificate = {
        coffeeType: data.content.coffeeType._id,
        issuedDate: data.content.issuedDate,
        issuedBy: data.content.issuedBy,
        expirationDate: data.content.expirationDate,
        certificateName: data.content.name,
      };
      this.cardFileBase64 = data.content.image;
      this.isFileSaved = true;
      this.isImage = true;
      this.editCertificateForm.patchValue(this.certificate);
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
  }

  onUpdateCertificate() {
    const certificate = this.editCertificateForm.value;
    certificate._id = this.id;
    certificate.file = this.cardFileBase64;
    this.helper.cleanObject(certificate);
    this.organisationService.updateCertificate(certificate)
      .subscribe(() => {
        this.setMessage('certificate successful updated!');
      }, (error) => {
        this.setError(error.errors);
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
}
