import {Component, OnInit, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {

  constructor(@Inject(MAT_DIALOG_DATA) public data, public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close();
  }
  ngOnDestroy(): void {
  }
}
