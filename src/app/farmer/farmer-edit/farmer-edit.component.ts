import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, ConfirmDialogService, FarmerService, OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services/location.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFarmerRequestComponent} from './edit-farmer-request/edit-farmer-request.component';
import {AddFarmerRequestComponent} from './add-farmer-request/add-farmer-request.component';
import {MessageService} from '../../core/services/message.service';

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

  constructor(private route: ActivatedRoute, private router: Router,
              private authenticationService: AuthenticationService,
              private farmerService: FarmerService,
              private organisationService: OrganisationService,
              private confirmDialogService: ConfirmDialogService,
              private messageService: MessageService,
              private locationService: LocationService, private modal: NgbModal) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.getFarmer(this.id);
    });
    this.message = this.messageService.getMessage();
  }

  editRequest(request: any) {
    const modalRef = this.modal.open(EditFarmerRequestComponent, {size: 'lg'});
    modalRef.componentInstance.land = request;
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
            .subscribe(data => {
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
    this.router.navigateByUrl('/admin/farmers');
  }
}
