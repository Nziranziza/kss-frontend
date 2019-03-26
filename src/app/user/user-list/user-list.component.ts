import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../core/services/user.service';
import {Organisation, User} from '../../core/models';
import {ConfirmDialogComponent} from '../../shared/layout';
import {ConfirmDialogService} from '../../core/services';

declare var $;

@Component({
  selector: 'app-user',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  organisationId: number;
  users: User[];
  message: string;

  constructor(private route: ActivatedRoute, private userService: UserService,
              private confirmDialogService: ConfirmDialogService) {
    $(() => {
      $('#organisations').DataTable();
    });
    this.getAllUsers();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];
    });
  }

  deleteUser(user: User): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.userService.destroy(this.organisationId, user.id)
            .subscribe(data => {
              this.getAllUsers();
              this.message = 'Record successful deleted!';
            });
          this.getAllUsers();
        }
      });
  }

  getAllUsers(): void {

    this.users = [{
      id: 1, firstName: 'first name', lastName: 'last name', title: 'officer', phoneNumber: '078880000111',
      email: 'user@naeb.rw', gender: 'male', organisationId: 1, password: '123456'
    }];
  }

}
