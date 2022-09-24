import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationService, AuthorisationService, ConfirmDialogService, FarmerService, MessageService} from '../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SeasonService} from '../../../core/services';
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
              private farmerService: FarmerService,
              private confirmDialogService: ConfirmDialogService,
              private authorisationService: AuthorisationService,
              private authenticationService: AuthenticationService,
              private modal: NgbModal) {
  }

  seasons: any;
  id: string;
  errors = [];
  message: string;
  isTechouseAdmin = false;

  ngOnInit() {
    this.message = this.messageService.getMessage();
    this.getSeasons();
    this.isTechouseAdmin = this.authorisationService.isTechouseAdmin();
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

  copySeason(): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to copy farmers requests from previous season ? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            operatorEmail: this.authenticationService.getCurrentUser().info.email,
            userId: this.authenticationService.getCurrentUser().info._id
          };
          this.farmerService.copySeason(body)
            .subscribe((data) => {
              this.message = data.message;
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }
}
