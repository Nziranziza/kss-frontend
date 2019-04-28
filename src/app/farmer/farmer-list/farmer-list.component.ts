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

  ngOnInit(): void {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 25,
      serverSide: true,
      processing: true,
      orderCellsTop: true,
      language: {
        processing: 'Loading...'
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.farmerService.getFarmers(dataTablesParameters)
          .subscribe(data => {
            this.farmers = data.data;
            callback({
              recordsTotal: data.recordsTotal,
              recordsFiltered: data.recordsFiltered,
              data: []
            });
          });

      },

    };

  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  deleteFarmer(farmer: Farmer): void {

    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.farmerService.destroy(farmer._id)
            .subscribe(data => {
              this.message = 'Record successful deleted!';
            });
        }
      });
  }

  viewDetails(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }
}
