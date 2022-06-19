import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Gap, GapService } from '../../../../core';
import { MessageService } from '../../../../core';
import { HelperService } from '../../../../core';
import { BasicComponent } from '../../../../core';

@Component({
  selector: 'app-gap-create',
  templateUrl: './gap-create.component.html',
  styleUrls: ['./gap-create.component.css'],
})
export class GapCreateComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  createForm: FormGroup;
  approachs = [
    { id: 'text_input', name: 'text_input' },
    { id: 'percentage_input', name: 'percentage_input' },
    { id: 'multiple_choice', name: 'multiple_choice' },
  ];
  loading = false;
  adoptionOptionsVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private gapService: GapService,
    private messageService: MessageService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      name: ['Pruning', Validators.required],
      description: ['Check whether is pruning correctly.', Validators.required],
      questions: new FormArray([], Validators.required),
    });
    this.addQuestion();

    this.initial();
    this.setMessage(this.messageService.getMessage());
  }

  get name() {
    return this.createForm.get('name');
  }
  get description() {
    return this.createForm.get('description');
  }

  questionTitle(index: number) {
    return this.formCategory.at(index).get('question');
  }

  answerType(index: number) {
    return this.formCategory.at(index).get('answerType');
  }

  onSubmit() {
    if (this.createForm.valid) {
      this.loading = true;
      const temp = this.createForm.getRawValue();

      const gap = {
        name: temp.name,
        description: temp.description,
        questions: temp.questions,
      };

      this.gapService.save(gap).subscribe(
        (data) => {
          this.loading = false;
          this.setMessage('Gap successfully created.');
          this.router.navigateByUrl('admin/gaps/list');
        },
        (err) => {
          this.setError(err.errors);
          this.loading = false;
        }
      );
    } else {
      if (
        this.helperService.getFormValidationErrors(this.createForm).length > 0
      ) {
        this.setError(
          this.helperService.getFormValidationErrors(this.createForm)
        );
      }
      if (this.createForm.get('questions').invalid) {
        this.setError('Missing required gap(s) information');
      }
    }
  }

  createQuestion(): FormGroup {
    return this.formBuilder.group({
      question: ['Is user practising pruning', Validators.required],
      answerType: ['', Validators.required],
      answers: new FormArray([]),
    });
  }

  createAnswer(): FormGroup {
    return this.formBuilder.group({
      answer: [''],
    });
  }

  addAnswer(index: number) {
    const question = (this.createForm.controls.questions as FormArray).controls[
      index
    ] as FormGroup;

    (question.controls.answers as FormArray).push(this.createAnswer());
  }

  get formCategory() {
    return this.createForm.get('questions') as FormArray;
  }

  questionAnswers(qIndex: number): FormArray {
    return this.formCategory.at(qIndex).get('answers') as FormArray;
  }

  removeQuestionAnswer(qIndex: number, aIndex: number) {
    this.questionAnswers(qIndex).removeAt(aIndex);
  }

  addQuestion() {
    (this.createForm.controls.questions as FormArray).push(
      this.createQuestion()
    );
    // this.addAnswer(
    //   (this.createForm.controls.questions as FormArray).length - 1
    // );
  }

  removeQuestion(index: number) {
    (this.createForm.controls.questions as FormArray).removeAt(index);
  }

  getQuestionsFormGroup(index: number): FormGroup {
    return this.formCategory.controls[index] as FormGroup;
  }

  onAdoptionMethodSelected(index: number) {
    const value = this.getQuestionsFormGroup(index).controls.answerType.value;
    if (value === 'multiple_choice') {
      this.adoptionOptionsVisible = true;
    }
  }

  onCancel() {
    // this.location.back();
  }

  initial() {}

  ngOnDestroy() {}
}
