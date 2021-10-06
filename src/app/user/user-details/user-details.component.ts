import {Component, Inject, Injector, Input, OnInit, PLATFORM_ID} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '../../core/services';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})

export class UserDetailsComponent implements OnInit {

  modal: NgbActiveModal;
  @Input() user;
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
    this.getSetPinStatus();
  }

  enableResetPin(status: boolean) {
    this.userService.allowSetPin({
      regNumber: this.user.regNumber,
      status
    }).subscribe(() => {
      this.getSetPinStatus();
    });
  }

  getSetPinStatus() {
    if (+this.user.hasAccessTo[0].userType === 13) {
      this.userService.isSetPinAllowed(this.user.regNumber).subscribe((data) => {
        this.resetPin = data.content.allowedToSetPin;
      });
    }
  }
}
