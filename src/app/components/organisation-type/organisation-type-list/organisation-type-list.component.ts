import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmDialogService, OrganisationTypeService} from '../../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {OrganisationType} from '../../../core/models';

@Component({
  selector: 'app-organisation-type-list',
  templateUrl: './organisation-type-list.component.html',
  styleUrls: ['./organisation-type-list.component.css']
})
export class OrganisationTypeListComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private organisationTypeService: OrganisationTypeService) {

  }

  message: string;
  organisationTypes: any;

  ngOnInit() {
    this.getAllOrganisationTypes();
  }

  ngOnDestroy(): void {

  }

  getAllOrganisationTypes(): void {
    this.organisationTypeService.all().subscribe(data => {
      if (data) {
        this.organisationTypes = data.content;
      }
    });
  }

}
