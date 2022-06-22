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
    { id: 'mark_input', name: 'Marks Input' },
    { id: 'percentage_input', name: 'Percentage Input' },
    { id: 'multiple_choice', name: 'multiple_choice' },
    { id: 'multiple_single', name: 'Multiple Choice - Single' },
    { id: 'yes_no', name: 'Yes/No' },
    {
      id: 'multiple_all_apply',
      name: 'Multiple Choice - All that Apply',
    },
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

  checkIfWeightMatch(index: number, aIndex: number) {
    const marks = this.formCategory.at(index).get('marks').value;
    const answers = (this.formCategory.at(index).get('answers') as FormArray)
      .controls;

    console.log(marks);
    console.log(answers);

    let sum = 0;
    for (const answer of answers) {
      sum = sum + (answer as FormGroup).controls.weight.value;
    }
    console.log(sum);
    if (sum === marks) {
      console.log(true);
      return true;
    } else {
      console.log(false);
      return false;
    }
  }

  weight(index: number, aIndex: number) {
    const answers = (this.formCategory.at(index).get('answers') as FormArray)
      .controls;
    const answer = answers[aIndex] as FormGroup;
    return answer.controls.weight;
  }

  marks(index: number) {
    return this.formCategory.at(index).get('marks');
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
      marks: [100],
    });
  }

  createAnswer(): FormGroup {
    return this.formBuilder.group({
      answer: [''],
      weight: [0],
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
