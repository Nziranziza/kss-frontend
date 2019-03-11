import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-list-message',
  templateUrl: './list-message.component.html',
  styleUrls: ['./list-message.component.css']
})
export class ListMessageComponent implements OnInit {

  @Input() message: string;

  constructor() {
  }

  ngOnInit() {
  }
}
