import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {AuthenticationService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {DryProcessingService} from '../../core/services';
import {CoffeeTypeService} from '../../core/services';
import {Subject} from 'rxjs';
import {BasicComponent} from '../../core/library';

@Component({
  selector: 'app-create-batch',
  templateUrl: './create-batch.component.html',
  styleUrls: ['./create-batch.component.css']
})
export class CreateBatchComponent extends BasicComponent implements OnInit, OnDestroy {

  constructor(private dryProcessingService: DryProcessingService, private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private helper: HelperService, private coffeeTypeService: CoffeeTypeService,
              private authenticationService: AuthenticationService) {
    super();
  }

  id: string;
  orgId: string;
  totalKgs = 0;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });
    this.dtTrigger.next();
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

}
