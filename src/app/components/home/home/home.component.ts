import { Component, OnInit } from '@angular/core';
import objectFitImages from 'object-fit-images';
declare var $;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $(() => {
      objectFitImages();
    });
  }
}
