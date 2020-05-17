import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-preview-deliveries-list',
  templateUrl: './preview-deliveries-list.component.html',
  styleUrls: ['./preview-deliveries-list.component.css']
})
export class PreviewDeliveriesListComponent implements OnInit {

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {}

  onNext() {
    this.router.navigateByUrl('admin/pay-farmers/confirm-payment');
  }

  onPrevious() {
    this.router.navigateByUrl('admin/pay-farmers/select-deliveries');
  }
}
