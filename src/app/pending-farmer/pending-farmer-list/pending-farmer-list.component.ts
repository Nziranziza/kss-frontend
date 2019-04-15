import {Component, OnDestroy, OnInit} from '@angular/core';
import {FarmerService} from '../../core/services';
import {Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Farmer} from '../../core/models';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-pending-farmer-list',
  templateUrl: './pending-farmer-list.component.html',
  styleUrls: ['./pending-farmer-list.component.css']
})
export class PendingFarmerListComponent implements OnInit, OnDestroy {

  constructor(private farmerService: FarmerService,
              private router: Router,
              private modal: NgbModal) {
  }

  message: string;
  farmers: any;
  title = 'Temporary Farmers';
  i: number;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();


  ngOnInit() {

    this.getAllFarmers();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      responsive: true,
    };
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  getAllFarmers(): void {
    console.log('test');
    this.farmerService.listPending().subscribe(data => {
      console.log(data);
      if (data) {
        this.farmers = data.content;
        this.dtTrigger.next();
      }
    });
  }

  viewDetails(farmer: Farmer) {
    console.log(farmer);
    const modalRef = this.modal.open(PendingFarmerListComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

}
