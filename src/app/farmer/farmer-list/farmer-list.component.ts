import {Component, OnInit} from '@angular/core';
import {ConfirmDialogService, FarmerService} from '../../core/services';
import {Router} from '@angular/router';
import {Farmer} from '../../core/models';

declare var $;
@Component({
  selector: 'app-farmer-list',
  templateUrl: './farmer-list.component.html',
  styleUrls: ['./farmer-list.component.css']
})
export class FarmerListComponent implements OnInit {

  constructor(private farmerService: FarmerService,
              private router: Router, private  confirmDialogService: ConfirmDialogService) {

  }

  message: string;
  farmers: any;
  title = 'Farmers';

  ngOnInit() {
    $(() => {
      $('#farmers').DataTable();
    });
    this.getAllFarmers();
  }

  deleteFarmer(farmer: Farmer): void {

    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.farmerService.destroy(farmer.id)
            .subscribe(data => {
              this.getAllFarmers();
              this.message = 'Record successful deleted!';
            });
          this.getAllFarmers();
        }
      });
  }

  getAllFarmers(): void {
    this.farmerService.all().subscribe(data => {
      return this.farmers = data;
    });
  }

}
