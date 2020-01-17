import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthenticationService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {DryProcessingService} from '../../core/services';
import {CoffeeTypeService} from '../../core/services';

@Component({
  selector: 'app-create-batch',
  templateUrl: './create-batch.component.html',
  styleUrls: ['./create-batch.component.css']
})
export class CreateBatchComponent implements OnInit {

  constructor(private dryProcessingService: DryProcessingService, private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private helper: HelperService, private coffeeTypeService: CoffeeTypeService,
              private authenticationService: AuthenticationService) {
  }
  id: string;
  selectedLots = [];
  createBatchForm: FormGroup;
  transferLotsForm: FormGroup;
  errors: any;
  coffeeTypes = [];
  message: any;
  orgId: string;
  totalKgs = 0;
  lots = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;

    this.createBatchForm = this.formBuilder.group({
      coffeeType: ['']
    });
    this.coffeeTypeService.all().subscribe((data) => {
      data.content.map((item) => {
        if (item.level === 'cws') {
          item.category.map((el) => {
            this.coffeeTypes.push(el);
          });
        }
      });
    });
  }
  selectLot(isChecked: boolean, lot: any) {
    if (isChecked) {
      this.selectedLots.push(lot);
      this.totalKgs = this.totalKgs + lot.totalKgs;
    } else {
      this.selectedLots.splice(this.selectedLots.indexOf(lot), 1);
      this.totalKgs = this.totalKgs - lot.totalKgs;
    }
  }
  createBatch() {
    if (this.createBatchForm.valid) {
      const lots = JSON.parse(JSON.stringify(this.createBatchForm.value));
      lots['lots'.toString()] = this.lots;
      this.dryProcessingService.createBatch(lots)
        .subscribe(() => {
            this.message = 'Batch successfully created!';
            this.errors = '';
          },
          (err) => {
            this.message = '';
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createBatchForm);
    }
  }
  onTransferLots() {
  }
}
