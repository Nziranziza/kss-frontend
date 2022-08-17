import { Component, OnInit } from '@angular/core';
import {PrivacyPoliceComponent} from '../privacy-police/privacy-police.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home-footer',
  templateUrl: './home-footer.component.html',
  styleUrls: ['./home-footer.component.css']
})
export class HomeFooterComponent implements OnInit {

  constructor(private modal: NgbModal) { }

  ngOnInit() {
  }
}
