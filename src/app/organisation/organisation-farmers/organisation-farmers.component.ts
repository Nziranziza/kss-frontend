import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmDialogService, OrganisationService} from '../../core/services';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {Farmer} from '../../core/models';
import {FarmerDetailsComponent} from '../../farmer/farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthorisationService} from '../../core/services/authorisation.service';

@Component({
  selector: 'app-organisation-farmers',
  templateUrl: './organisation-farmers.component.html',
  styleUrls: ['./organisation-farmers.component.css']
})
export class OrganisationFarmersComponent implements OnInit, OnDestroy {

  constructor(private organisationService: OrganisationService,
              private route: ActivatedRoute, private  confirmDialogService: ConfirmDialogService,
              private modal: NgbModal, private authorisationService: AuthorisationService) {
  }

  message: string;
  farmers: any;
  organisationId: string;
  dtOptions: any = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = false;
  isUserCWSOfficer = true;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
    this.getFarmers(this.organisationId);
    this.isUserCWSOfficer = this.authorisationService.isCWSUser();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getFarmers(orgId: string): void {
    this.loading = true;
    this.organisationService.getOrgFarmers(orgId).subscribe(data => {
      if (data) {
        this.farmers = data.content;
        this.dtTrigger.next();
        this.loading = false;
      }
    });
  }
  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }
}
