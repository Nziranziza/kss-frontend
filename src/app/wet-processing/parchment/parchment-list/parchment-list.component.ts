import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmDialogService, MessageService} from '../../../core/services';
import {ParchmentService} from '../../../core/services';
import {AuthenticationService} from '../../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ParchmentCreateComponent} from '../parchment-create/parchment-create.component';
import {BasicComponent} from '../../../core/library';

@Component({
  selector: 'app-parchment-list',
  templateUrl: './parchment-list.component.html',
  styleUrls: ['./parchment-list.component.css']
})

export class ParchmentListComponent extends BasicComponent implements OnInit, OnDestroy {

  filterForm: FormGroup;
  maxSize = 9;
  order = 'coffeeType.name';
  reverse = true;
  directionLinks = true;
  parchments = [];
  title = 'Parchment';
  id = 'parchments-list';
  parameters: any;
  config: any;
  autoHide = false;
  responsive = false;
  labels: any = {
    previousLabel: 'Previous',
    nextLabel: 'Next',
    screenReaderPaginationLabel: 'Pagination',
    screenReaderPageLabel: 'page',
    screenReaderCurrentLabel: `You're on page`
  };
  loading = false;
  searchFields = [
    {value: 'date', name: 'date'},
    {value: 'type', name: 'type'}
  ];
  summary: any;
  filter: any;
  seasonStartingDate: string;

  constructor(private parchmentService: ParchmentService,
              private router: Router,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private confirmDialogService: ConfirmDialogService,
              private modal: NgbModal,
              private authenticationService: AuthenticationService) {
    super();
    this.parameters = {
      length: 25,
      start: 0,
      draw: 1
    };
  }

  ngOnInit(): void {
    this.parameters['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
    this.seasonStartingDate = this.authenticationService.getCurrentSeason().created_at;
    this.config = {
      itemsPerPage: 10,
      currentPage: 1,
      totalItems: 0
    };
    this.parchmentService.all(this.parameters)
      .subscribe(data => {
        this.parchments = data.data;
        if (this.parchments.length > 0) {
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
        }
      });
    this.setOrder('created_at');
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['date']
    });
    this.productionSummary();
    this.message = this.messageService.getMessage();
  }

  createParchment() {
    const modalRef = this.modal.open(ParchmentCreateComponent, {size: 'lg'});
    modalRef.result.then((message) => {
      this.setMessage(message);
      this.parchmentService.all(this.parameters)
        .subscribe(data => {
          this.parchments = data.data;
          if (this.parchments.length > 0) {
            this.config = {
              itemsPerPage: this.parameters.length,
              currentPage: this.parameters.start + 1,
              totalItems: data.recordsTotal
            };
          }
        });
    });
    this.setOrder('created_at');
  }

  onPageChange(event) {
    this.config.currentPage = event;
    if (event >= 1) {
      this.parameters.start = (event - 1) * this.config.itemsPerPage;
    }

    this.parchmentService.all(this.parameters)
      .subscribe(data => {
        this.parchments = data.data;
      });
    this.setOrder('created_at');
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  productionSummary() {
    this.filter = {
      date: {
        from: this.seasonStartingDate,
        to: new Date()
      },
      location: {
        searchBy: 'cws',
        cws_id: this.authenticationService.getCurrentUser().info.org_id
      }
    };
    this.parchmentService.detailedReport(this.filter).subscribe((data) => {
      this.summary = data.content[0].parchments;
    });
  }

  onFilter() {
    if (this.filterForm.valid) {
      this.loading = true;
      this.parameters['search'.toString()] = this.filterForm.value;
      this.parchmentService.all(this.parameters)
        .subscribe(data => {
          this.parchments = data.data;
          this.config = {
            itemsPerPage: this.parameters.length,
            currentPage: this.parameters.start + 1,
            totalItems: data.recordsTotal
          };
          this.loading = false;
        });
      this.setOrder('created_at');
    }
  }

  cancelParchment(parchmentId: string): void {
    this.confirmDialogService.openConfirmDialog('Are you sure you want to cancel this record? ' +
      'action cannot be undone').afterClosed().subscribe(
      res => {
        if (res) {
          const body = {
            userId: this.authenticationService.getCurrentUser().info._id,
            parchmentId
          };
          this.parchmentService.cancelParchment(body).subscribe((response) => {
            this.setMessage(response.message);
            this.parchmentService.all(this.parameters)
              .subscribe(data => {
                this.parchments = data.data;
                this.config = {
                  itemsPerPage: this.parameters.length,
                  currentPage: this.parameters.start + 1,
                  totalItems: data.recordsTotal
                };
              });
            this.setOrder('created_at');
          }, (err) => {
            this.setError(err.errors);
          });
        }
      });
  }

  onClearFilter() {
    this.filterForm.controls.term.reset();
    delete this.parameters.search;
    this.parchmentService.all(this.parameters)
      .subscribe(data => {
        this.parchments = data.data;
        this.config = {
          itemsPerPage: this.parameters.length,
          currentPage: this.parameters.start + 1,
          totalItems: data.recordsTotal
        };
      });
    this.setOrder('created_at');
  }

  ngOnDestroy(): void {
    this.messageService.clearMessage();
  }
}
