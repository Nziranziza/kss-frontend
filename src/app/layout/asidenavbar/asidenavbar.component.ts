import {Component, OnInit} from '@angular/core';
import {PoliceService} from '../../core/services';

@Component({
  selector: 'app-asidenavbar',
  templateUrl: './asidenavbar.component.html',
  styleUrls: ['./asidenavbar.component.css']
})
export class AsidenavbarComponent implements OnInit {

  constructor(private policeService: PoliceService) {
  }

  police: any;

  ngOnInit() {
    this.police = this.policeService;
  }
}
