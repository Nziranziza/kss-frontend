import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AuthenticationService, InputDistributionService, MessageService} from '../../../../core/services';
import {HelperService} from '../../../../core/helpers';
import {isPlatformBrowser} from '@angular/common';
import {BasicComponent} from '../../../../core/library';

@Component({
  selector: 'app-apply-pesticide',
  templateUrl: './apply-pesticide.component.html',
  styleUrls: ['./apply-pesticide.component.css']
})
export class ApplyPesticideComponent extends BasicComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() requestId;
  @Input() regNumber;
  @Input() documentId;
  @Input() siteId;
  distributionForm: FormGroup;
  errors: string [];
  message: string;
  stocks = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private injector: Injector, private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private helper: HelperService, private inputDistributionService: InputDistributionService) {
    super();
    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit(): void {
    this.distributionForm = this.formBuilder.group({
      pesticides: new FormArray([])
    });
    this.inputDistributionService.getSiteStockOuts(this.siteId).subscribe((data) => {
      data.content.map((stock) => {
        if (stock.input.inputType === 'Pesticide' && stock.returnedQty === 0) {
          const control = new FormControl(false);
          this.stocks.push(stock);
          (this.distributionForm.controls.pesticides as FormArray).push(control);
        }
      });
    });
  }

  onSubmit() {
    if (this.distributionForm.valid) {
      const selectedPesticide = this.distributionForm.value.pesticides
        .map((checked, index) => checked ? this.stocks[index]._id : null)
        .filter(value => value !== null);
      const record = JSON.parse(JSON.stringify(this.distributionForm.value));
      record['documentId'.toString()] = this.documentId;
      record['farmerRequestId'.toString()] = this.requestId;
      record['siteId'.toString()] = this.siteId;
      record['pesticides'.toString()] = selectedPesticide;
      record['regNumber'.toString()] = this.regNumber;
      record.pesticides.map((value, i) => {
        record.pesticides [i] = {
          stockId: value
        };
      });
      this.inputDistributionService.applyPesticide(record).subscribe(() => {
          this.modal.close('Pesticide applied!');
          this.distributionForm.reset();
        },
        (err) => {
          this.setError(err.errors);
        });
    } else {
      this.setError(this.helper.getFormValidationErrors(this.distributionForm));
    }
  }

  getDestination(destinations) {
    let str = '';
    destinations.map ((dest) => {
      str = str + ' - ' + dest.cell_id.name;
    });
    return str;
  }
}
