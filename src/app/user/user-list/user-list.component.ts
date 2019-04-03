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
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];

    });
    this.getAllUsers();
  }

  deleteUser(user: User): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to delete this record?').afterClosed().subscribe(
      res => {
        if (res) {
          this.userService.destroy(user._id)
            .subscribe(data => {
              this.getAllUsers();
              this.message = 'Record successful deleted!';
            });
          this.getAllUsers();
        }
      });
  }

  getAllUsers(): void {
    this.userService.all(this.organisationId).subscribe(data => {
      if (data) {
        this.users = data.content;
      }
    });
  }
}
