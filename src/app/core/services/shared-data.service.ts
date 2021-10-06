import {EventEmitter, Injectable, Output} from '@angular/core';
import {AuthorisationService} from './authorisation.service';
import {FarmerService} from './farmer.service';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  @Output() fire: EventEmitter<any> = new EventEmitter();

  constructor(
    private authorisationService: AuthorisationService,
    private farmerService: FarmerService,
    private authenticationService: AuthenticationService) {
  }

  changeApprovalFlag() {
    if (this.authorisationService.isDistrictCashCropOfficer()) {
      this.farmerService.calculateNeedForApprovals(this.authenticationService.getCurrentUser().info.location.dist_id).subscribe((data) => {
        this.fire.emit(data.content[0]);
      });
    }
  }

  getEmittedApprovalFlag() {
    return this.fire;
  }
}
