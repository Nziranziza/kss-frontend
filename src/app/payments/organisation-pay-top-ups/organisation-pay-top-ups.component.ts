import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BasicComponent} from '../../core/library';

@Component({
  selector: 'app-organisation-pay-top-ups',
  templateUrl: './organisation-pay-top-ups.component.html',
  styleUrls: ['./organisation-pay-top-ups.component.css']
})
export class OrganisationPayTopUpsComponent extends BasicComponent implements OnInit {

  previewImagePath: any;
  depositForm: FormGroup;
  mobileTransferForm: FormGroup;
  imageError: string;
  isImageSaved: boolean;
  cardImageBase64: string;

  constructor(private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.depositForm = this.formBuilder.group({
      amount: ['', Validators.required],
      wallet: ['ikofi', Validators.required]
    });

    this.mobileTransferForm = this.formBuilder.group({
      amount: ['', Validators.required],
      wallet: ['ikofi', Validators.required],
      subscription_number: ['', Validators.required]
    });
  }

  onSubmitDeposit() {
    if (this.depositForm.valid) {
    }
  }


  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      // Size Filter Bytes
      const maxSize = 20971520;
      const allowedTypes = ['image/png', 'image/jpeg'];
      const maxHeight = 15200;
      const maxWidth = 25600;

      if (fileInput.target.files[0].size > maxSize) {
        this.imageError =
          'Maximum size allowed is ' + maxSize / 1000 + 'Mb';
        return false;
      }

      if (!allowedTypes.includes(fileInput.target.files[0].type)) {
        this.imageError = 'Only Images are allowed ( JPG | PNG )';
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const imgHeight = rs.currentTarget['height'.toString()];
          const imgWidth = rs.currentTarget['width'.toString()];
          console.log(imgHeight, imgWidth);
          if (imgHeight > maxHeight && imgWidth > maxWidth) {
            this.imageError =
              'Maximum dimensions allowed ' +
              maxHeight +
              '*' +
              maxWidth +
              'px';
            return false;
          } else {
            const imgBase64Path = e.target.result;
            this.cardImageBase64 = imgBase64Path;
            this.isImageSaved = true;
            this.previewImagePath = imgBase64Path;
          }
        };
      };

      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  removeImage() {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
  }
}
