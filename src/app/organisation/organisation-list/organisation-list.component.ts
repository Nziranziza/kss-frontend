import {Component, OnInit} from '@angular/core';
import {OrganisationService} from '../../core/services';
import {Organisation} from '../../core/models';
import {Router} from '@angular/router';
import {ConfirmDialogService} from '../../core/services';

declare var $;

@Component({
  selector: 'app-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.css']
})
export class OrganisationListComponent implements OnInit {

  constructor(private organisationService: OrganisationService,
              private router: Router, private  confirmDialogService: ConfirmDialogService) {

  }

  message: string;
  organisations: any;

  ngOnInit() {
    $(() => {
      $('#organisations').DataTable();
    });
    this.getAllOrganisations();
  }

  deleteOrganisation(organisation: Organisation): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.organisationService.destroy(organisation._id)
            .subscribe(data => {
              this.getAllOrganisations();
              this.message = 'Record successful deleted!';
            });
          this.getAllOrganisations();
        }
      });
  }

  getAllOrganisations(): void {
    this.organisationService.all().subscribe(data => {
      return this.organisations = data.content;
    });
  }

}
