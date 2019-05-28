import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FarmerService, OrganisationService} from '../../core/services';
import {LocationService} from '../../core/services/location.service';
import {Farmer} from '../../core/models';
import {FarmerDetailsComponent} from '../farmer-details/farmer-details.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-farmer-edit',
  templateUrl: './farmer-edit.component.html',
  styleUrls: ['./farmer-edit.component.css']
})
export class FarmerEditComponent implements OnInit {

  farmer: any;

  constructor(private route: ActivatedRoute, private router: Router,
              private farmerService: FarmerService,
              private organisationService: OrganisationService,
              private locationService: LocationService, private modal: NgbModal) {
  }

  ngOnInit() {
  }

  editFarmerProfile(farmer: Farmer) {
    const modalRef = this.modal.open(FarmerDetailsComponent, {size: 'lg'});
    modalRef.componentInstance.farmer = farmer;
  }

}
