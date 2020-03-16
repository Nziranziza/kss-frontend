import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthenticationService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {DryProcessingService} from '../../core/services';
import {CoffeeTypeService} from '../../core/services';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-create-batch',
  templateUrl: './create-batch.component.html',
  styleUrls: ['./create-batch.component.css']
})
export class CreateBatchComponent implements OnInit, OnDestroy {

  constructor(private dryProcessingService: DryProcessingService, private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private helper: HelperService, private coffeeTypeService: CoffeeTypeService,
              private authenticationService: AuthenticationService) {
  }
  id: string;
  selectedLots = [];
  errors: any;
  coffeeTypes = [];
  message: any;
  orgId: string;
  totalKgs = 0;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  lots = [];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });
    this.dtTrigger.next();
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
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

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

}
