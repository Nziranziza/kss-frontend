import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ConfirmDialogComponent} from './layouts/confirm-dialog/confirm-dialog.component';


@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private dialog: MatDialog) {
  }

  openConfirmDialog(msg: string, size?: string) {
    if (!size) {
      size = '450px';
    }
    return this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      width: size + 'px',
      data: {
        message: msg,
      }
    });
  }
}

