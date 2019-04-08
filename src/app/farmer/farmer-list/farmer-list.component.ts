import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmDialogService, FarmerService} from '../../core/services';
import {Router} from '@angular/router';
import {Farmer} from '../../core/models';
import {Subject} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';

declare var $;

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
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();


  ngOnInit() {
    $(() => {
      $('#farmers').DataTable();
    });
    this.getAllFarmers();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25
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
      }
    });
  }

  viewDetails(id: string) {
    console.log(id);
    const modalRef = this.modal.open(FarmerDetailsComponent, { size: 'lg'});
    modalRef.componentInstance.farmer = id;
  }
}
