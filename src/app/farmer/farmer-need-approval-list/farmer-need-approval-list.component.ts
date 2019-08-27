import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SiteService} from '../../core/services/site.service';
import {AuthenticationService} from '../../core/services';

@Component({
  selector: 'app-farmer-need-approval-list',
  templateUrl: './farmer-need-approval-list.component.html',
  styleUrls: ['./farmer-need-approval-list.component.css']
})
export class FarmerNeedApprovalListComponent implements OnInit {

  requestIds = [];
  title = 'Farmer info to be approved';
  filterForm: FormGroup;
  sites: any;
  requests: any;
  site: any;

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.filterForm = this.formBuilder.group({
      site: ['']
    });

    const body = {
      searchBy: 'district',
      dist_id: this.authenticationService.getCurrentUser().info.location.dist_id
    };
    this.siteService.getZone(body).subscribe((data) => {
      this.sites = data.content;
    });

  }

  selectRequest(isChecked: boolean, request) {
    if (isChecked) {
      this.requestIds.push(request._id);
    } else {
      this.requestIds.splice(this.requestIds.indexOf(request._id), 1);
    }
  }

  onFilter() {
  }

  onApprove() {
  }

  getWaitingUpdates() {
  }
}
