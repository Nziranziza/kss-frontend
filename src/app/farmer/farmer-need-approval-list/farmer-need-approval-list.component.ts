import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SiteService} from '../../core/services/site.service';
import {AuthenticationService, OrganisationService} from '../../core/services';

@Component({
  selector: 'app-farmer-need-approval-list',
  templateUrl: './farmer-need-approval-list.component.html',
  styleUrls: ['./farmer-need-approval-list.component.css']
})
export class FarmerNeedApprovalListComponent implements OnInit {

  requestIds = [];
  title = 'Farmer to be approved';
  filterForm: FormGroup;
  sites: any;
  requests: any;
  site: any;

  constructor(private formBuilder: FormBuilder, private siteService: SiteService,
              private authenticationService: AuthenticationService,
              private organisationService: OrganisationService) {
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

  selectRequest(isChecked: boolean) {
    if (isChecked) {
      const temp = {};
      this.requestIds.push(temp);
    } else {
    }
  }
  onFilter() {}
}
