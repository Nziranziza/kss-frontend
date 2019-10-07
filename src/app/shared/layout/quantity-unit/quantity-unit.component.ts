import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-quantity-unit',
  templateUrl: './quantity-unit.component.html',
  styleUrls: ['./quantity-unit.component.css']
})
export class QuantityUnitComponent implements OnInit {

  constructor() {
  }

  @Input() inputType: string;

  ngOnInit() {
  }
}
