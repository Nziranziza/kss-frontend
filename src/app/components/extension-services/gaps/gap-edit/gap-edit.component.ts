import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Answer, Gap, GapService, Question } from '../../../../core';
import { MessageService } from '../../../../core';
import { HelperService } from '../../../../core';
import { BasicComponent } from '../../../../core';

@Component({
  selector: 'app-gap-edit',
  templateUrl: './gap-edit.component.html',
  styleUrls: ['./gap-edit.component.css'],
})
export class GapEditComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  id: string;
  createForm: FormGroup;
  approachs = [
    { id: 'text_input', name: 'text_input' },
    { id: 'percentage_input', name: 'percentage_input' },
    { id: 'multiple_choice', name: 'multiple_choice' },
  ];
  loading = false;
  adoptionOptionsVisible = false;
  gap: Gap;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private gapService: GapService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params['id'.toString()];
    });

    this.getGap();

    this.createForm = this.formBuilder.group({
      _id: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      questions: new FormArray([], Validators.required),
    });

    this.initial();
    this.setMessage(this.messageService.getMessage());
  }

  getGap() {
    this.gapService.one(this.id).subscribe((data) => {
      if (data && data.data) {
        this.gap = data.data;
        this.createForm.controls._id.setValue(this.gap._id);
        this.createForm.controls.name.setValue(this.gap.name);
        this.createForm.controls.description.setValue(this.gap.description, {
          onlySelf: true,
        });
        this.gap.questions.forEach((value, index) => {
          this.addQuestions(value, index);
        });
      }
    });
  }

  addQuestions(element: Question, index: number) {
    const questions = this.createForm.controls.questions as FormArray;
    questions.push(this.createQuestion());
    questions.at(index).get('_id').setValue(element._id);
    questions.at(index).get('question').setValue(element.question);
    questions.at(index).get('answerType').setValue(element.answerType);

    element.answers.forEach((value, aindex) => {
      this.addAnswers(value, index, aindex);
    });
  }

  addAnswers(element: Answer, qIndex: number, aIndex: number) {
    const question = (this.createForm.controls.questions as FormArray).controls[
      qIndex
    ] as FormGroup;

    const answers = question.controls.answers as FormArray;
    answers.push(this.createAnswer());
    answers.at(aIndex).get('_id').setValue(element._id);
    answers.at(aIndex).get('answer').setValue(element.answer);
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
      this.gap = this.createForm.getRawValue();
      this.gapService.update(this.gap, this.id).subscribe(
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
      _id: [ Validators.required],
      question: ['Is user practising pruning', Validators.required],
      answerType: ['', Validators.required],
      answers: new FormArray([]),
    });
  }

  createAnswer(): FormGroup {
    return this.formBuilder.group({
      _id: [],
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
