import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {AuthenticationService, AuthorisationService, CherrySupplyService} from '../../core';
import {isArray} from 'util';
import {UserService} from '../../core';

@Component({
  selector: 'app-farmer-details',
  templateUrl: './farmer-details.component.html',
  styleUrls: ['./farmer-details.component.css']
})
export class FarmerDetailsComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() farmer;
  requests: any;
  resetPin = true;
  showSetPinButton = false;
  body = {};

  graph = {
    type: 'ColumnChart',
    data: [
    ],
    options: {
      colors: ['#94c17d'],
      height: '100%',
      width: '100%',
      chartArea: {
        height: '70%',
        width: '60%'    }
    },
    columnNames: ['Year', 'Yield'],
    width : 550,
    height : 400,
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
    private cherrySupplyService: CherrySupplyService,
    private authorisationService: AuthorisationService,
    private authenticationService: AuthenticationService,
    private injector: Injector) {

    if (isPlatformBrowser(this.platformId)) {
      this.modal = this.injector.get(NgbActiveModal);
    }
  }

  ngOnInit() {
    if (this.farmer.request) {
      if (isArray(this.farmer.request.requestInfo)) {
        this.requests = this.farmer.request.requestInfo;
      } else {
        this.requests = [this.farmer.request.requestInfo];
      }
    } else if (this.farmer.requests) {
      if (isArray(this.farmer.requests.requestInfo)) {
        this.requests = this.farmer.requests.requestInfo;
      } else {
        this.requests = [this.farmer.requests.requestInfo];
      }
    }
    if (this.authorisationService.isCWSUser()) {
      this.body = {
        regNumber: this.farmer.userInfo.regNumber,
        org_id: this.authenticationService.getCurrentUser().info.org_id
      };
    } else {
      this.body = {
        regNumber: this.farmer.userInfo.regNumber,
      };
    }
    this.cherrySupplyService.getFarmerDeliveriesStats(this.body).subscribe((data) => {
      this.graph.data = [];
      data.content.map((season) => {
        this.graph.data.push([season._id, season.suppliedQty]);
      });
    });
    this.getSetPinStatus();
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
}
