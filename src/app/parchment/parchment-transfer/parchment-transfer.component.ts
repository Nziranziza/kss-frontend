import {Component, OnInit} from '@angular/core';
import {ParchmentService} from '../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthenticationService, OrganisationService} from '../../core/services';
import {HelperService} from '../../core/helpers';
import {MessageService} from '../../core/services';
import {Location} from '@angular/common';

@Component({
  selector: 'app-parchment-transfer',
  templateUrl: './parchment-transfer.component.html',
  styleUrls: ['./parchment-transfer.component.css']
})
export class ParchmentTransferComponent implements OnInit {

  constructor(private parchmentService: ParchmentService, private route: ActivatedRoute, private router: Router,
              private formBuilder: FormBuilder,
              private location: Location,
              private organisationService: OrganisationService, private helper: HelperService,
              private authenticationService: AuthenticationService, private messageService: MessageService) {
  }

  parchment: any;
  id: string;
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
        this.messageService.setMessage(data.message);
        this.router.navigateByUrl('/admin/cws/parchments/list');
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
}
