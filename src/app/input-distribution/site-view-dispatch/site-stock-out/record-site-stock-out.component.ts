import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../../core/services';
import {MessageService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {InputDistributionService} from '../../../core/services';
import {DatePipe, isPlatformBrowser} from '@angular/common';
import {constant} from '../../../../environments/constant';

@Component({
  selector: 'app-record-site-stock-out',
  templateUrl: './record-site-stock-out.component.html',
  providers: [DatePipe],
  styleUrls: ['./record-site-stock-out.component.css']
})
export class RecordSiteStockOutComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() dispatch;
  siteStockOutForm: FormGroup;
  errors: string [];
  message: string;
  kgPerBag: number;
  lPerJerrycan: number;
  currentDate: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private datePipe: DatePipe,
    private helper: HelperService, private inputDistributionService: InputDistributionService) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }
  ngOnInit(): void {
    this.currentDate = new Date();
    this.siteStockOutForm = this.formBuilder.group({
      numberOfBags: ['', Validators.required],
      totalQty: ['', Validators.required],
      date: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required]
    });
    this.kgPerBag = constant.kgPerBag;
    this.lPerJerrycan = constant.lPerJerrycan;
    this.onChanges();
  }

  onSubmit() {
    if (this.siteStockOutForm.valid) {
      const record = JSON.parse(JSON.stringify(this.siteStockOutForm.value));
      record['dispatchId'.toString()] = this.dispatch._id;
      record['userId'.toString()] = this.authenticationService.getCurrentUser().info._id;
      this.inputDistributionService.recordStockOut(record).subscribe(() => {
          this.messageService.setMessage('Stock out recorded!');
          this.modal.dismiss();
        },
        (err) => {
          this.errors = err.errors;
        });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.siteStockOutForm);
    }
  }
  onChanges() {
    this.siteStockOutForm.controls.numberOfBags.valueChanges.subscribe(
      (value) => {
        if (value !== '') {
          if (this.dispatch.inputType === 'Fertilizer') {
            this.siteStockOutForm.controls.totalQty.setValue(+value * this.kgPerBag);
          } else {
            this.siteStockOutForm.controls.totalQty.setValue(+value * this.lPerJerrycan);
          }
        }
      }
    );
  }
}
