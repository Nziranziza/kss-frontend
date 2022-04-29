import { Component, OnInit } from '@angular/core';
import {BasicComponent, FarmService, HelperService} from '../../../core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-trees-variety-create',
  templateUrl: './trees-variety-create.component.html',
  styleUrls: ['./trees-variety-create.component.css']
})
export class TreesVarietyCreateComponent extends BasicComponent implements OnInit {

  createForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
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
      this.farmService.createTreesVariety(variety).subscribe((response) => {
        this.setMessage(response.message);
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.createForm);
    }
  }

}
