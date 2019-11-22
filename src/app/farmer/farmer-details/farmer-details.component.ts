import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {isPlatformBrowser} from '@angular/common';
import {isArray} from 'util';
import {UserService} from '../../core/services';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: object, private userService: UserService,
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
    this.userService.isSetPinAllowed(this.farmer.userInfo.regNumber).subscribe((data) => {
      this.resetPin = data.content.allowedToSetPin;
    });
  }
}
