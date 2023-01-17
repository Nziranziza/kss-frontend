import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  constructor() { }

  @Input() text: string;
  @Input() loading = false;
  @Input() btClass: string;
  @Output() clickEvent = new EventEmitter();

  ngOnInit(): void {
  }

  handleClick() {
    this.clickEvent.emit();
  }


}
