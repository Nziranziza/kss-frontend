import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmDialogService, OrganisationTypeService} from '../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {OrganisationType} from '../../core/models';

@Component({
  selector: 'app-organisation-type-list',
  templateUrl: './organisation-type-list.component.html',
  styleUrls: ['./organisation-type-list.component.css']
})
export class OrganisationTypeListComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private organisationTypeService: OrganisationTypeService,
              private router: Router, private  confirmDialogService: ConfirmDialogService) {

  }

  message: string;
  organisationTypes: any;

  ngOnInit() {
    this.getAllOrganisationTypes();
  }

  ngOnDestroy(): void {

  }


  deleteOrganisationType(organisationType: OrganisationType): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.organisationTypeService.destroy(organisationType._id)
            .subscribe(data => {
              this.getAllOrganisationTypes();
              this.message = 'Record successful deleted!';
            });
          this.getAllOrganisationTypes();
        }
      });
  }

  getAllOrganisationTypes(): void {
    this.organisationTypeService.all().subscribe(data => {
      if (data) {
        this.organisationTypes = data.content;
      }
    });
  }

}
