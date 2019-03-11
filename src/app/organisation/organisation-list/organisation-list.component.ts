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
  organisations: Organisation[] = [
    {id: 1, name: 'Organisation 1', email: 'organistaion1@org.rw', tin: 1234},

  ];

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
          this.organisationService.destroy(organisation.id)
            .subscribe(data => {
              this.getAllOrganisations();
              this.message = data.message;
            });
          this.getAllOrganisations();
        }
      });
  }

  editOrganisation(organisation: Organisation): void {
    window.localStorage.removeItem('editOrganisationId');
    window.localStorage.setItem('editOrganisationId', organisation.id.toString());
    this.router.navigateByUrl('admin/organisations/edit');
  }

  addOrganisation(): void {
    this.router.navigateByUrl('admin/organisations/create');
  }

  getAllOrganisations(): void {
    this.organisationService.all().subscribe(data => {
      return this.organisations;
    });
  }

}
