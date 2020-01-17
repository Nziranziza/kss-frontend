import {Component, OnInit} from '@angular/core';
import {FarmerService} from '../../core/services';
import {ActivatedRoute} from '@angular/router';
import {HelperService} from '../../core/helpers';

@Component({
  selector: 'app-farmer-lands',
  templateUrl: './farmer-lands.component.html',
  styleUrls: ['./farmer-lands.component.css']
})
export class FarmerLandsComponent implements OnInit {

  requests: any;
  message: string;
  value: string;

  constructor(private farmerService: FarmerService, private route: ActivatedRoute, private helperService: HelperService) {
  }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.getRequests(params.farmerId);
      });
  }

  getRequests(farmerId: string) {
    this.farmerService.getFarmerLands(farmerId).subscribe(data => {
      this.requests = data.content[0].requestInfo;
      this.requests = this.requests.map((item) => {
        item['locationInfo'.toString()] = [];
        item['locationInfo'.toString()]['provinceName'.toString()] =
          this.helperService.getProvinceName(item.location.prov_id);
        item['locationInfo'.toString()]['districtName'.toString()] =
          this.helperService.getDistrictName(item.location.prov_id, item.location.dist_id);
        item['locationInfo'.toString()]['sectorName'.toString()] =
          this.helperService.getSectorName(item.location.dist_id, item.location.sect_id);
        item['locationInfo'.toString()]['cellName'.toString()] =
          this.helperService.getCellName(item.location.sect_id, item.location.cell_id);
        item['locationInfo'.toString()]['villageName'.toString()] =
          this.helperService.getVillageName(item.location.cell_id, item.location.village_id);
        return item;
      });
    }, (err) => {
      console.log(err.errors);
    });
  }
}
