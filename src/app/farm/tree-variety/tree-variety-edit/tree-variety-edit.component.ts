import { Component, OnInit } from '@angular/core';
import {BasicComponent, FarmService, HelperService} from '../../../core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-tree-variety-edit',
  templateUrl: './tree-variety-edit.component.html',
  styleUrls: ['./tree-variety-edit.component.css']
})
export class TreeVarietyEditComponent extends BasicComponent implements OnInit {

  editForm: FormGroup;
  id: string;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private farmService: FarmService,
              private helper: HelperService) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'.toString()];
    });

    this.editForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      acronym: ['', Validators.required],
    });

    this.farmService.getTreeVariety(this.id).subscribe((data) => {
      this.editForm.patchValue(data.content);
    });
  }

  onSubmit() {
    if (this.editForm.valid) {
      const variety = this.editForm.value;
      this.farmService.createTreeVariety(variety).subscribe((response) => {
        this.setMessage(response.message);
      }, (err) => {
        this.setError(err.errors);
      });
    } else {
      this.errors = this.helper.getFormValidationErrors(this.editForm);
    }
  }
}
