import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-farmer-lands',
  templateUrl: './farmer-lands.component.html',
  styleUrls: ['./farmer-lands.component.css']
})
export class FarmerLandsComponent implements OnInit {

  requests: any;
  message: string;
  constructor() { }

  ngOnInit() {
  }

}
