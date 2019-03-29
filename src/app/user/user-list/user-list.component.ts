import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../core/services/user.service';
import {User} from '../../core/models';
import {ConfirmDialogService} from '../../core/services';

declare var $;

@Component({
  selector: 'app-user',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  organisationId: string;
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
          this.userService.destroy(this.organisationId, user._id)
            .subscribe(data => {
              this.getAllUsers();
              this.message = 'Record successful deleted!';
            });
          this.getAllUsers();
        }
      });
  }

  getAllUsers(): void {

  }
}
