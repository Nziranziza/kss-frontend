import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {
  AuthenticationService,
  ConfirmDialogService,
  FarmerService,
  OrganisationService,
  SiteService,
  UserService
} from '../../../core';
import {LocationService} from '../../../core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFarmerRequestComponent} from './edit-farmer-request/edit-farmer-request.component';
import {AddFarmerRequestComponent} from './add-farmer-request/add-farmer-request.component';
import {MessageService} from '../../../core';
import {Location} from '@angular/common';
import {EditFarmerProfileComponent} from './edit-farmer-profile/edit-farmer-profile.component';
import {EditRequestComponent} from '../../input-distribution/edit-request/edit-request.component';
import {AuthorisationService} from '../../../core';
import {BasicComponent} from '../../../core';

@Component({
  selector: 'app-farmer-edit',
  templateUrl: './farmer-edit.component.html',
  styleUrls: ['./farmer-edit.component.css']
})
export class FarmerEditComponent extends BasicComponent implements OnInit, OnDestroy {

  farmer: any;
  requests: any [];
  id: string;
  errors = [];
  farmerType = 1;
  message: string;
  isUserSiteManager = false;
  isCWSOfficer = false;
  isUserDCC = false;
  site: any;
  org: any;
  resetPin = true;
  showSetPinButton = false;
  totalTrees = 0;

  constructor(private route: ActivatedRoute, private router: Router,
              private authenticationService: AuthenticationService,
              private authorisationService: AuthorisationService,
              private siteService: SiteService,
              private farmerService: FarmerService,
              private organisationService: OrganisationService,
              private confirmDialogService: ConfirmDialogService,
              private userService: UserService,
              private messageService: MessageService,
              private locationService: LocationService, private modal: NgbModal, private location: Location) {
    super();
  }

  ngOnInit() {
    this.message = this.messageService.getMessage();
    this.isUserSiteManager = this.authorisationService.isSiteManager();
    this.isCWSOfficer = this.authorisationService.isCWSAdmin();
    this.isUserDCC = this.authorisationService.isDistrictCashCropOfficer();
    if (this.authenticationService.getCurrentUser().orgInfo.distributionSite) {
      this.siteService.get(this.authenticationService.getCurrentUser().orgInfo.distributionSite).subscribe((site) => {
        this.site = site.content;
      });
    }
    this.organisationService.get(this.authenticationService.getCurrentUser().info.org_id).subscribe(data => {
      this.org = data.content;
    });
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
      this.getFarmer(this.id);
    });
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
    modalRef.result.then((message) => {
      this.setMessage(message);
      this.getFarmer(this.id);
    });
  }

  getFarmer(id: string) {
    this.farmerService.get(id).subscribe(data => {
      this.farmer = data.content[0];
      if (this.farmer.userInfo.type) {
        this.farmerType = this.farmer.userInfo.type;
      }
      if (this.authorisationService.isCWSUser()) {
        const villagesSet = [];
        this.org.coveredSectors.map((sector) => {
          sector.coveredVillages.map((village) => {
            villagesSet.push(village.village_id);
          });
        });
        this.requests = this.farmer.request.requestInfo.filter((req) => {
          return req;

          // TODO: Uncomment this!! this is highly needed.
          // if (villagesSet.includes(req.location.village_id._id)) {
          //   return req;
          // }
        });
        this.totalTrees = this.requests.reduce( (tot, record) => {
          return tot + record.numberOfTrees;
        },0);
      } else if (this.authorisationService.isSiteManager() && (!this.isCWSOfficer)) {
        const sectorsSet = [];
        this.site.coveredAreas.coveredSectors.map((sector) => {
          sectorsSet.push(sector.sect_id);
        });
        this.requests = this.farmer.request.requestInfo.filter((req) => {
          if (sectorsSet.includes(req.location.sect_id._id)) {
            return req;
          }
        });
        this.totalTrees = this.requests.reduce( (tot, record) => {
          return tot + record.numberOfTrees;
        },0);
      } else if (this.authorisationService.isDistrictCashCropOfficer()) {
        this.requests = this.farmer.request.requestInfo.filter((req) => {
          return (req.location.dist_id._id === this.authenticationService.getCurrentUser().info.location.dist_id);
        });
        this.totalTrees = this.requests.reduce( (tot, record) => {
          return tot + record.numberOfTrees;
        },0);
      } else {
        this.requests = this.farmer.request.requestInfo;
        this.totalTrees = this.requests.reduce( (tot, record) => {
          return tot + record.numberOfTrees;
        },0);
      }
      this.getSetPinStatus();
    });
  }

  enableResetPin(status: boolean) {
    this.userService.allowSetPin({
      regNumber: this.farmer.userInfo.regNumber,
      status
    }).subscribe(() => {
      this.getSetPinStatus();
    });
  }

  getSetPinStatus() {
    this.showSetPinButton = false;
    this.userService.isSetPinAllowed(this.farmer.userInfo.regNumber).subscribe((data) => {
      this.showSetPinButton = true;
      this.resetPin = data.content.allowedToSetPin;
    });
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }

  onCancel() {
    this.location.back();
  }
}
