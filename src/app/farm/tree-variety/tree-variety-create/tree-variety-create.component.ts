import { Component, OnInit } from '@angular/core';
import {BasicComponent, FarmService, HelperService, MessageService} from '../../../core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tree-variety-create',
  templateUrl: './tree-variety-create.component.html',
  styleUrls: ['./tree-variety-create.component.css']
})
export class TreeVarietyCreateComponent extends BasicComponent implements OnInit {

  createForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private messageService: MessageService,
              private router: Router, private farmService: FarmService, private helper: HelperService) {
    super();
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      acronym: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.createForm.valid) {
      const variety = this.createForm.value;
      this.farmService.createTreeVariety(variety).subscribe((response) => {
        this.messageService.setMessage(response.message);
        this.router.navigateByUrl('admin/farm/tree-varieties/list');
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

}
