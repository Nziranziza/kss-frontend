import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../core/services/user.service';
import {User} from '../../core/models';
import {ConfirmDialogService} from '../../core/services';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {

  organisationId: string;
  users: User[];
  message: string;
  dtOptions: DataTables.Settings = {};
  // @ts-ignore
  dtTrigger: Subject = new Subject();

  constructor(private route: ActivatedRoute, private userService: UserService,
              private confirmDialogService: ConfirmDialogService) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.organisationId = params['organisationId'.toString()];

    });
    this.getAllUsers();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
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
        this.dtTrigger.next();
      }
    });
  }
}
