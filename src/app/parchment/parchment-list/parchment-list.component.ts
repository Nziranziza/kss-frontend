import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from '../../core/services';
import {ParchmentService} from '../../core/services';
import {AuthenticationService} from '../../core/services';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ParchmentCreateComponent} from '../parchment-create/parchment-create.component';
import {BasicComponent} from '../../core/library';

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

  constructor(private parchmentService: ParchmentService,
              private router: Router,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private modal: NgbModal,
              private authenticationService: AuthenticationService) {
    super();
    this.parameters = {
      length: 10,
      start: 0,
      draw: 1
    };
  }

  ngOnInit(): void {
    this.parameters['org_id'.toString()] = this.authenticationService.getCurrentUser().info.org_id;
    this.config = {
      itemsPerPage: 25,
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
    this.filterForm = this.formBuilder.group({
      term: ['', Validators.minLength(3)],
      searchBy: ['date']
    });

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
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
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
    }
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
  }
  ngOnDestroy(): void {
    this.messageService.setMessage('');
  }
}
