import {Component, OnDestroy, OnInit} from '@angular/core';
import {ParchmentService} from '../../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService, OrganisationService} from '../../../core/services';
import {HelperService} from '../../../core/helpers';
import {DatePipe, Location} from '@angular/common';

@Component({
  selector: 'app-parchment-transfer',
  templateUrl: './parchment-transfer.component.html',
  styleUrls: ['./parchment-transfer.component.css']
})
export class ParchmentTransferComponent implements OnInit, OnDestroy {

  constructor(private parchmentService: ParchmentService, private route: ActivatedRoute, private router: Router,
              private formBuilder: FormBuilder,
              private location: Location,
              private datePipe: DatePipe,
              private organisationService: OrganisationService, private helper: HelperService,
              private authenticationService: AuthenticationService) {
  }

  parchment: any;
  id: string;
  organisations: any;
  transferLotsForm: FormGroup;
  errors: any;
  message: any;
  orgId: string;
  totalKgs = 0;
  currentDate: any;

  ngOnInit(): void {
    this.currentDate = new Date();
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });
    this.orgId = this.authenticationService.getCurrentUser().info.org_id;
    this.transferLotsForm = this.formBuilder.group({
      destOrgId: [''],
      releaseDate: [this.datePipe.transform(this.currentDate, 'yyyy-MM-dd'), Validators.required],
      totalKgs: [0]
    });
    this.parchmentService.get(this.id, this.orgId).subscribe((parchment) => {
      this.parchment = parchment.content;
    });
    this.organisationService.all().subscribe(data => {
      if (data) {
        this.organisations = data.content;
      }
    });
  }

  onTransferLots() {
    if (this.transferLotsForm.valid) {
      const transfer = JSON.parse(JSON.stringify(this.transferLotsForm.value));
      transfer['parchmentId'.toString()] = this.parchment._id;
      this.parchmentService.transfer(transfer).subscribe((data) => {
        this.message = data.message;
        this.parchmentService.get(this.id, this.orgId).subscribe((parchment) => {
          this.parchment = parchment.content;
        });
      }, (err) => {
        this.errors = err.errors;
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.transferLotsForm);
    }
  }

  onCancel() {
    this.location.back();
  }

  ngOnDestroy(): void {
  }
}
