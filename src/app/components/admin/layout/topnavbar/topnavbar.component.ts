import { Component, OnInit } from '@angular/core';
import {
  AuthenticationService,
  AuthorisationService,
  FarmerService,
  SeasonService,
} from '../../../../core';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../../core/services/shared-data.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-topnavbar',
  templateUrl: './topnavbar.component.html',
  styleUrls: ['./topnavbar.component.css'],
})
export class TopnavbarComponent implements OnInit {
  surname: string;
  orgName: string;
  seasons: any[];
  currentSeason: any;
  needOfApproval = 0;
  updatedLandToApprove = 0;
  newLandToApprove = 0;
  private subscription: Subscription;

  constructor(
    private authenticationService: AuthenticationService,
    private authorisationService: AuthorisationService,
    private sharedDataService: SharedDataService,
    private router: Router,
    private farmerService: FarmerService,
    private seasonService: SeasonService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.surname = this.authenticationService.getCurrentUser().info.surname;
    this.orgName = this.authenticationService.getCurrentUser().orgInfo.orgName;
    this.seasonService.all().subscribe((data) => {
      this.seasons = data.content;
      this.currentSeason = this.authenticationService.getCurrentSeason();
    });
    this.sharedDataService.changeApprovalFlag();
    this.subscription = this.sharedDataService
      .getEmittedApprovalFlag()
      .subscribe((item) => {
        this.needOfApproval =
          item.totalUpdatedLandToBeApproved + item.totalNewLandToApproved;
        this.updatedLandToApprove = item.totalUpdatedLandToBeApproved;
        this.newLandToApprove = item.totalNewLandToApproved;
      });
  }

  changeSeason(season: string) {
    const body = {
      id: season,
    };
    this.seasonService.changeSeason(body).subscribe((data) => {
      this.currentSeason = data.content;
      this.authenticationService.setCurrentSeason(this.currentSeason);
      location.reload();
    });
  }

  onLogOut() {
    this.authenticationService.purgeAuth();
    this.router.navigateByUrl('login');
  }

  setLanguage(language: string) {
    this.translate.setDefaultLang(language);
    this.translate.use(language);
  }
}
