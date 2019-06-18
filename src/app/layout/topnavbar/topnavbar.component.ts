import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../core/services';
import {SeasonService} from '../../core/services/season.service';
import {AuthorisationService} from '../../core/services/authorisation.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-topnavbar',
  templateUrl: './topnavbar.component.html',
  styleUrls: ['./topnavbar.component.css']
})
export class TopnavbarComponent implements OnInit {

  surname: string;
  orgName: string;
  seasons: any [];
  currentSeason = {};

  constructor(private authenticationService: AuthenticationService,
              private seasonService: SeasonService) {
  }

  ngOnInit() {
    this.surname = this.authenticationService.getCurrentUser().info.surname;
    this.orgName = this.authenticationService.getCurrentUser().orgInfo.orgName;
    this.seasonService.all().subscribe((data) => {
      this.seasons = data.content;
      this.currentSeason = this.authenticationService.getCurrentSeason();
    });
  }

  changeSeason(season: string) {
    const body = {
      id: season
    };
    this.seasonService.changeSeason(body).subscribe((data) => {
      this.currentSeason = data.content;
      this.authenticationService.setCurrentSeason(this.currentSeason);
      location.reload();
    });
  }
}
