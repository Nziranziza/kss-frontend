import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmDialogService, FarmerService} from '../../core/services';
import {Router} from '@angular/router';
import {Farmer} from '../../core/models';
import {Subject} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';


@Component({
  selector: 'app-farmer-list',
  templateUrl: './farmer-list.component.html',
  styleUrls: ['./farmer-list.component.css'],
})
export class FarmerListComponent implements OnInit, OnDestroy {

  constructor(private farmerService: FarmerService,
              private router: Router, private  confirmDialogService: ConfirmDialogService,
              private modal: NgbModal) {
  }

  message: string;
  farmers: any;
  title = 'Farmers';
  i: number;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();
  loading = true;

  ngOnInit() {
    this.getAllFarmers();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      responsive: true,
      processing: true,
    };
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  deleteFarmer(farmer: Farmer): void {

    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.farmerService.destroy(farmer._id)
            .subscribe(data => {
              this.getAllFarmers();
              this.dtTrigger.next();
              this.message = 'Record successful deleted!';
            });
          this.getAllFarmers();
        }
      });
  }

  getAllFarmers(): void {
    this.farmerService.all().subscribe(data => {
      if (data) {
        this.farmers = data.content;
        this.dtTrigger.next();
        this.loading = false;
      }
    });
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }
}
