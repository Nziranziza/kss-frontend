import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ConfirmDialogComponent} from '../../shared/layout';


@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private dialog: MatDialog) {
  }

  openConfirmDialog(msg: string) {
    return this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      width: '450px',
      data: {
        message: msg,
      },
      position: {top: '8%'}
    });
  }
}

