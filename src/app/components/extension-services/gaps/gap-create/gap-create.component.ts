import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { BasicComponent, GapService, HelperService, MessageService } from '../../../../core';

@Component({
  selector: 'app-gap-create',
  templateUrl: './gap-create.component.html',
  styleUrls: ['./gap-create.component.css'],
})
export class GapCreateComponent
  extends BasicComponent
  implements OnInit, OnDestroy {
  createForm: UntypedFormGroup;
  approachs = [
    { id: 'mark_input', name: 'Marks Input' },
    { id: 'multiple_single', name: 'Multiple Choice - Single' },
    { id: 'yes_no', name: 'Yes/No' },
    {
      id: 'multiple_apply',
      name: 'Multiple Choice - All that Apply',
    }
  ];
  loading = false;
  gapTotalWeight = 100 - parseInt(this.cookieService.get('gapTotal-weight'), 10);
  scoreStatus = [false, 0, 0, false];
  answerScoreExceeded = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private helperService: HelperService,
    private gapService: GapService,
    private messageService: MessageService,
    private router: Router,
    private cookieService: CookieService,
  ) {
    super();
  }

  /*********
   * Form Manipulation Getter Methods to get form field controls
   */

  // FORMERLY formCategory

  get getQuestionSections() {
    return this.createForm.get('sections') as UntypedFormArray;
  }

  get gapGame() {
    return this.createForm.get('gap_name');
  }

  get getGapWeight() {
    return this.createForm.get('gap_weight');
  }

  get getGapScore() {
    return this.createForm.get('gap_score');
  }

  get getGapDescription() {
    return this.createForm.get('picture_text');
  }

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      gap_name: ['', Validators.required],
      // description: ['Check whether is pruning correctly.', Validators.required],
      sections: new UntypedFormArray([], Validators.required),
      gap_weight: [0, [Validators.required, Validators.max(this.gapTotalWeight)]],
      gap_score: [100, Validators.required],
      picture_text: ['', Validators.required]
    });

    // By Default Add a Question Section to the GAP FORM
    this.addQuestionSection();

    this.initial();
    this.setMessage(this.messageService.getMessage());
    this.onChanges();
  }

  // Method Add a new question section to the GAP form
  addQuestionSection() {
    const sections = (this.createForm.controls.sections as UntypedFormArray);
    sections.push(this.createQuestionSection());
    this.addQuestionToSection(sections.length - 1);
  }

  removeQuestionSection(sectionIndex: number) {
    this.getQuestionSections.removeAt(sectionIndex);
  }

  // Method creates a new Form Group for a question
  createQuestionSection(): UntypedFormGroup {
    return this.formBuilder.group({
      section_name: ['', Validators.required],
      questions: new UntypedFormArray([])
    });
  }

  // Method Add a new question section to the GAP form
  addQuestionToSection(sectionIndex) {
    const section = (this.createForm.controls.sections as UntypedFormArray).controls[
      sectionIndex
    ] as UntypedFormGroup;
    (section.controls.questions as UntypedFormArray).push(this.createQuestion());
  }

  createQuestion(): UntypedFormGroup {
    return this.formBuilder.group({
      question: ['', Validators.required],
      description: ['', Validators.required],
      question_type: ['', Validators.required],
      weight: [0, Validators.required],
      answers: new UntypedFormArray([]),
      is_not_applicable: [false]
    });
  }

  // validate question score to overall score

  validateScore(value: any) {
    const totalScore = this.getGapScore.value;
    let currentIndex = 0;
    let parentIndex = 0;
    let marks = 0;

    // calculate total question score

    console.log(value);
    const sumAllWeight = value.map((item, i) => {
      parentIndex = i;
      this.answerScoreExceeded = false;
      const sum = item.questions.map((newWeight, index) => {
        let currScore = 0;
        currentIndex = index;
        if (newWeight.weight) {
          currScore = parseInt(newWeight.weight, 10);
        }
        if (newWeight.answers.length > 0) {
          newWeight.answers.map((answer) => {
            if (answer.weight > newWeight.weight) {
              this.answerScoreExceeded = true;
            }
          })
        }
        return currScore;
      }).reduce((currSum, prevSum) => currSum + prevSum, 0);
      return sum
    }).reduce((partialSum, a) => partialSum + a, 0);
    if (totalScore - sumAllWeight <= 100) {
      marks = totalScore - sumAllWeight;
    }

    // compare gap score and total question score and return current question
    return [(totalScore !== sumAllWeight), currentIndex, parentIndex, marks > 0 ? true : false];
  }

  addAnswersToQuestion(sectionIndex, qstIndex) {
    const section = (this.createForm.controls.sections as UntypedFormArray).controls[
      sectionIndex
    ] as UntypedFormGroup;
    const question = (section.controls.questions as UntypedFormArray).controls[qstIndex] as UntypedFormGroup;
    (question.controls.answers as UntypedFormArray).push(this.createAnswer());
  }

  createAnswer(): UntypedFormGroup {
    return this.formBuilder.group({
      answer: ['', Validators.required],
      description: ['', Validators.required],
      weight: [0, Validators.required],
      is_not_applicable: [false, Validators.required]
    });
  }

  /*********
   * GAP Manipulation methods
   */

  chooseIfApplicable(event, sectionIndex: number, qstIndex: number) {
    for (const form of this.getSectionQuestions(sectionIndex).controls) {
      form.get('is_not_applicable').setValue(false);
    }
    this.getSectionQuestions(sectionIndex).at(qstIndex).get('is_not_applicable').setValue(event.target.checked);
  }

  chooseIfAnswerApplicable(event, sectionIndex: number, qstIndex: number, answIndex: number) {
    for (const form of this.getQuestionAnswers(sectionIndex, qstIndex).controls) {
      form.get('is_not_applicable').setValue(false);
    }
    this.getQuestionAnswers(sectionIndex, qstIndex).at(answIndex).get('is_not_applicable').setValue(event.target.checked);
  }

  /*********
   * Section Answers Form Manipulation methods
   */


  onQuestionTypeSelected(sectionIndex: number, qstIndex: number) {
    const questions = this.getSectionQuestions(sectionIndex).controls;
    const question = questions[qstIndex] as UntypedFormGroup;

    if (question.controls.question_type.value === 'multiple_single' || question.controls.question_type.value === 'multiple_apply') {
      this.removeAllQuestionAnswers(sectionIndex, qstIndex);
      this.addAnswersToQuestion(sectionIndex, qstIndex);
    } else {
      this.removeAllQuestionAnswers(sectionIndex, qstIndex);
    }
  }

  removeAllQuestionAnswers(sectionIndex, qstIndex) {
    this.getQuestionAnswers(sectionIndex, qstIndex).clear();
  }

  getSectionName(index: number) {
    return this.getQuestionSections.at(index).get('section_name');
  }

  // Methods for validating Question Fields

  getQuestionField(field: string, sectionIndex: number, qstIndex: number) {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get(field);
  }

  getAnswerField(field: string, sectionIndex: number, qstIndex: number, answIndex: number) {
    return this.getQuestionAnswers(sectionIndex, qstIndex).at(answIndex).get(field);
  }

  getQuestionApplicable(sectionIndex: number, qstIndex: number) {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('is_not_applicable').value;
  }

  getAnswerApplicable(sectionIndex: number, qstIndex: number, answIndex: number) {
    return this.getQuestionAnswers(sectionIndex, qstIndex).at(answIndex).get('is_not_applicable').value;
  }

  getSectionQuestions(qIndex: number): UntypedFormArray {
    return this.getQuestionSections.at(qIndex).get('questions') as UntypedFormArray;
  }

  getQuestionAnswers(sectionIndex: number, qstIndex: number): UntypedFormArray {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('answers') as UntypedFormArray;
  }

  getQuestionType(sectionIndex: number, qstIndex: number) {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('question_type')
  }

  checkIFMultipleQuestion(sectionIndex: number, qstIndex: number) {
    const type = this.getQuestionType(sectionIndex, qstIndex);
    return type.value === 'multiple_single' || type.value === 'multiple_apply';
  }

  removeQuestionAnswer(sectionIndex, qstIndex, ansIndex) {
    this.getQuestionAnswers(sectionIndex, qstIndex).removeAt(ansIndex);
  }

  removeQuestion(sectionIndex, qstIndex) {
    this.getSectionQuestions(sectionIndex).removeAt(qstIndex);
  }

  onSubmit() {
    // First validate high level
    this.createForm.markAllAsTouched();

    if (this.createForm.valid) {
      this.loading = true;
      const temp = this.createForm.getRawValue();

      const gap = {
        gap_name: temp.gap_name,
        gap_weight: temp.gap_weight,
        gap_score: temp.gap_score,
        picture_text: temp.picture_text,
        sections: temp.sections
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
      if (this.createForm.get('sections').invalid) {
        this.setError('Missing required gap(s) information');
      }
    }
  }

  onCancel() {
    // this.location.back();
  }

  initial() {
  }

  onChanges() {
    this.getQuestionSections.valueChanges.subscribe((value) => {
      this.scoreStatus = this.validateScore(value);
    });
  }

  ngOnDestroy() {
  }
}
