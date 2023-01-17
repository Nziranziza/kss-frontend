import { Component, Input, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnInit {

  constructor(
    private spinner: NgxSpinnerService
  ) {
  }

  @Input() loading = false;

  ngOnInit() {
    if (this.loading) {
      this.spinner.show();
    } else {
      this.spinner.hide();
    }
  }
}
