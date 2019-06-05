import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmDialogService, FarmerService, OrganisationService} from '../../core/services';
import {MessageService} from '../../core/services/message.service';
import {LocationService} from '../../core/services/location.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {EditFarmerRequestComponent} from '../../farmer/farmer-edit/edit-farmer-request/edit-farmer-request.component';
import {AddFarmerRequestComponent} from '../../farmer/farmer-edit/add-farmer-request/add-farmer-request.component';
import {SeasonService} from '../../core/services/season.service';
import {EditSeasonComponent} from './edit-season/edit-season.component';
import {CreateSeasonComponent} from './create-season/create-season.component';

@Component({
  selector: 'app-season-parameters',
  templateUrl: './season-parameters.component.html',
  styleUrls: ['./season-parameters.component.css']
})
export class SeasonParametersComponent implements OnInit, OnDestroy {

  seasons: any [];
  id: string;
  errors = [];
  message: string;

  constructor(private route: ActivatedRoute, private router: Router,
              private seasonService: SeasonService,
              private messageService: MessageService,
              private modal: NgbModal) {
  }

  ngOnInit() {
    this.message = this.messageService.getMessage();
  }

  editSeason(season: any) {
    const modalRef = this.modal.open(EditSeasonComponent, {size: 'lg'});
    modalRef.componentInstance.season = season;
    modalRef.componentInstance.seasonId = this.id;
    modalRef.result.finally(() => {
      this.getSeasons();
    });
  }

  addSeason() {
    const modalRef = this.modal.open(CreateSeasonComponent, {size: 'lg'});
    modalRef.result.finally(() => {
      this.getSeasons();
    });
  }

  getSeasons() {
    this.seasonService.all().subscribe(data => {
    });
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }
}
