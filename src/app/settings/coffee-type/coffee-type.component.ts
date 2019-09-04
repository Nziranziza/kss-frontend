import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoffeeTypeService} from '../../core/services';

@Component({
  selector: 'app-coffee-type',
  templateUrl: './coffee-type.component.html',
  styleUrls: ['./coffee-type.component.css']
})
export class CoffeeTypeComponent implements OnInit {

  constructor(private route: ActivatedRoute, private coffeeTypeService: CoffeeTypeService) {

  }

  message: string;
  coffeeTypes: any;

  ngOnInit() {
    this.getAllCoffeeTypes();
  }

  getAllCoffeeTypes(): void {
    this.coffeeTypeService.all().subscribe(data => {
      if (data) {
        this.coffeeTypes = data.content;
      }
    });
  }

}
