import {Component, OnInit} from '@angular/core';
import {ParchmentService} from '../../core/services/parchment.service';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {HelperService} from '../../core/helpers';

@Component({
  selector: 'app-parchment-transfer',
  templateUrl: './parchment-transfer.component.html',
  styleUrls: ['./parchment-transfer.component.css']
})
export class ParchmentTransferComponent implements OnInit {

  constructor(private parchmentService: ParchmentService, private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private organisationService: OrganisationService, private helper: HelperService,
              private authenticationService: AuthenticationService) {
  }

  parchment: any;
  id: string;
  lots = [];
  organisations: any;
  transferLotsForm: FormGroup;
  errors: any;
  message: any;
  orgId: string;
  totalKgs = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });

    this.orgId = this.authenticationService.getCurrentUser().info.org_id;

    this.transferLotsForm = this.formBuilder.group({
      destOrgId: [''],
      releaseDate: [''],
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

  selectLot(isChecked: boolean, lot: any) {
    if (isChecked) {
      this.lots.push(lot);
      this.totalKgs = this.totalKgs + lot.totalKgs;
    } else {
      this.lots.splice(this.lots.indexOf(lot), 1);
      this.totalKgs = this.totalKgs - lot.totalKgs;
    }
  }

  onTransferLots() {
    if (this.transferLotsForm.valid) {
      const lots = JSON.parse(JSON.stringify(this.transferLotsForm.value));
      lots['parchmentId'.toString()] = this.id;
      lots['lots'.toString()] = this.lots;
      this.parchmentService.transfer(lots)
        .subscribe(data => {
            this.message = 'Lots successfully transferred!';
            this.errors = '';
            this.parchmentService.get(this.id, this.orgId).subscribe((parchment) => {
              this.parchment = parchment.content;
            });
          },
          (err) => {
            this.message = '';
            this.errors = err.errors;
          });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.transferLotsForm);
    }
  }
}
