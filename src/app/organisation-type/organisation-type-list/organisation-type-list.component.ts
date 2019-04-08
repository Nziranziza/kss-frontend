import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmDialogService, OrganisationTypeService} from '../../core/services';
import {ActivatedRoute, Router} from '@angular/router';
import {OrganisationType} from '../../core/models';
import {Subject} from 'rxjs';

declare var $;

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
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  ngOnInit() {
    $(() => {
      $('#organisation-types').DataTable();
    });
    this.getAllOrganisationTypes();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
    };
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
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
        this.dtTrigger.next();
      }
    });
  }

}
