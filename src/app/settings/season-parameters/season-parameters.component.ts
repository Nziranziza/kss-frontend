import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService} from '../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SeasonService} from '../../core/services';
import {EditSeasonComponent} from './edit-season/edit-season.component';
import {CreateSeasonComponent} from './create-season/create-season.component';

@Component({
  selector: 'app-season-parameters',
  templateUrl: './season-parameters.component.html',
  styleUrls: ['./season-parameters.component.css']
})
export class SeasonParametersComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private router: Router,
              private seasonService: SeasonService,
              private messageService: MessageService,
              private modal: NgbModal) {
  }

  seasons: any;
  id: string;
  errors = [];
  message: string;

  ngOnInit() {
    this.message = this.messageService.getMessage();
    this.getSeasons();
  }

  editSeason(season: any) {
    const modalRef = this.modal.open(EditSeasonComponent, {size: 'lg'});
    modalRef.componentInstance.season = season;
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
      this.seasons = data.content;
    });
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }
}
