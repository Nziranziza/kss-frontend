import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, ConfirmDialogService, FarmerService, OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFarmerRequestComponent} from './edit-farmer-request/edit-farmer-request.component';
import {AddFarmerRequestComponent} from './add-farmer-request/add-farmer-request.component';
import {MessageService} from '../../core/services';
import {Location} from '@angular/common';
import {EditFarmerProfileComponent} from './edit-farmer-profile/edit-farmer-profile.component';
import {EditRequestComponent} from '../../input-distribution/edit-request/edit-request.component';
import {AuthorisationService} from '../../core/services';

@Component({
  selector: 'app-farmer-edit',
  templateUrl: './farmer-edit.component.html',
  styleUrls: ['./farmer-edit.component.css']
})
export class FarmerEditComponent implements OnInit, OnDestroy {

  farmer: any;
  requests: any [];
  id: string;
  errors = [];
  farmerType = 1;
  message: string;
  canEditLands = true;
  isUserSiteManager = false;


  constructor(private route: ActivatedRoute, private router: Router,
              private authenticationService: AuthenticationService,
              private authorisationService: AuthorisationService,
              private farmerService: FarmerService,
              private organisationService: OrganisationService,
              private confirmDialogService: ConfirmDialogService,
              private messageService: MessageService,
              private locationService: LocationService, private modal: NgbModal, private location: Location) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.getFarmer(this.id);
    });
    this.message = this.messageService.getMessage();
    if (this.authorisationService.isCWSUser()) {
      this.canEditLands = false;
    }
    this.isUserSiteManager = this.authorisationService.isSiteManager();
  }

  editRequest(request: any) {
    const modalRef = this.modal.open(EditFarmerRequestComponent, {size: 'lg'});
    modalRef.componentInstance.land = request;
    modalRef.componentInstance.farmerId = this.id;
    modalRef.result.finally(() => {
      this.getFarmer(this.id);
    });
  }

  editRequestAtDistribution(request: any) {
    const modalRef = this.modal.open(EditRequestComponent, {size: 'lg'});
    modalRef.componentInstance.land = request;
    modalRef.componentInstance.farmerId = this.id;
    modalRef.result.finally(() => {
      this.getFarmer(this.id);
    });
  }

  editProfile(farmer: any) {
    const modalRef = this.modal.open(EditFarmerProfileComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
    modalRef.componentInstance.farmerId = this.id;
    modalRef.result.finally(() => {
      this.getFarmer(this.id);
    });
  }

  cancelRequest(request: any): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this request? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            documentId: this.id,
            subDocumentId: request._id
          };
          this.farmerService.destroyRequest(body)
            .subscribe(() => {
              this.getFarmer(this.id);
            });
          this.getFarmer(this.id);
        }
      });
  }

  addRequest(id: string) {
    const modalRef = this.modal.open(AddFarmerRequestComponent, {size: 'lg'});
    modalRef.componentInstance.farmerId = id;
    modalRef.result.finally(() => {
      this.getFarmer(this.id);
    });
  }

  getFarmer(id: string) {
    this.farmerService.get(id).subscribe(data => {
      this.farmer = data.content[0];
      if (this.farmer.userInfo.type) {
        this.farmerType = this.farmer.userInfo.type;
      }
      this.requests = this.farmer.request.requestInfo;
    });
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }

  onCancel() {
    this.location.back();
  }
}
