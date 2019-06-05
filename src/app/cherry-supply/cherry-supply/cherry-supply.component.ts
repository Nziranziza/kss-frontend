import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HelperService} from '../../core/helpers';
import {CherrySupplyService} from '../../core/services/cherry-supply.service';

@Component({
  selector: 'app-cherry-supply',
  templateUrl: './cherry-supply.component.html',
  styleUrls: ['./cherry-supply.component.css']
})
export class CherrySupplyComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private cherrySupplyService: CherrySupplyService,
              private router: Router, private helper: HelperService) {
  }

  recordCherryDeliveryForm: FormGroup;
  errors: string[];

  ngOnInit() {
    this.recordCherryDeliveryForm = this.formBuilder.group({
      cherriesQty: ['', Validators.required],
      unitPerKg: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.recordCherryDeliveryForm.valid) {
      const record = this.recordCherryDeliveryForm.value;
      this.cherrySupplyService.saveDelivery(record)
        .subscribe(data => {
            return;
          },
          (err) => {
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.recordCherryDeliveryForm);
    }
  }
}
