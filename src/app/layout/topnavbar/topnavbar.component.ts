import {Component, OnInit} from '@angular/core';
import {AuthenticationService, AuthorisationService, FarmerService} from '../../core/services';
import {SeasonService} from '../../core/services';
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
  currentSeason: any;
  needOfApproval = 0;

  constructor(private authenticationService: AuthenticationService,
              private authorisationService: AuthorisationService,
              private router: Router, private farmerService: FarmerService,
              private seasonService: SeasonService) {
  }

  ngOnInit() {
    this.surname = this.authenticationService.getCurrentUser().info.surname;
    this.orgName = this.authenticationService.getCurrentUser().orgInfo.orgName;
    this.seasonService.all().subscribe((data) => {
      this.seasons = data.content;
      this.currentSeason = this.authenticationService.getCurrentSeason();
    });
    if (this.authorisationService.isDistrictCashCropOfficer()) {
      this.farmerService.calculateNeedForApprovals(this.authenticationService.getCurrentUser().info.location.dist_id).subscribe((data) => {
        this.needOfApproval = data.content[0].totalUnapproved;
      });
    }
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

  onLogOut() {
    this.authenticationService.purgeAuth();
    this.router.navigateByUrl('login');
  }
}
