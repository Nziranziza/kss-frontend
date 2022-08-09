import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {BasicComponent, GapService, HelperService, MessageService} from '../../../../core';

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
    {id: 'mark_input', name: 'Marks Input'},
    {id: 'multiple_single', name: 'Multiple Choice - Single'},
    {id: 'yes_no', name: 'Yes/No'},
    {
      id: 'multiple_apply',
      name: 'Multiple Choice - All that Apply',
    }
  ];
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private gapService: GapService,
    private messageService: MessageService,
    private router: Router
  ) {
    super();
  }

  /*********
   * Form Manipulation Getter Methods to get form field controls
   */

  // FORMERLY formCategory

  get getQuestionSections() {
    return this.createForm.get('sections') as FormArray;
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

  ngOnInit() {
    this.createForm = this.formBuilder.group({
      gap_name: ['', Validators.required],
      // description: ['Check whether is pruning correctly.', Validators.required],
      sections: new FormArray([], Validators.required),
      gap_weight: [20, Validators.required],
      gap_score: [100, Validators.required],
      picture_text: ['', Validators.required]
    });

    // By Default Add a Question Section to the GAP FORM
    this.addQuestionSection();

    this.initial();
    this.setMessage(this.messageService.getMessage());
  }

  // Method Add a new question section to the GAP form
  addQuestionSection() {
    const sections = (this.createForm.controls.sections as FormArray);
    sections.push(this.createQuestionSection());
    this.addQuestionToSection(sections.length - 1);
  }

  removeQuestionSection(sectionIndex: number) {
    this.getQuestionSections.removeAt(sectionIndex);
  }

  // Method creates a new Form Group for a question
  createQuestionSection(): FormGroup {
    return this.formBuilder.group({
      section_name: ['', Validators.required],
      questions: new FormArray([])
    });
  }

  // Method Add a new question section to the GAP form
  addQuestionToSection(sectionIndex) {
    const section = (this.createForm.controls.sections as FormArray).controls[
      sectionIndex
      ] as FormGroup;

    (section.controls.questions as FormArray).push(this.createQuestion());
  }

  createQuestion(): FormGroup {
    return this.formBuilder.group({
      question: ['', Validators.required],
      description: ['', Validators.required],
      question_type: ['', Validators.required],
      weight: ['', Validators.required],
      answers: new FormArray([]),
      is_not_applicable: [false, Validators.required]
    });
  }

  addAnswersToQuestion(sectionIndex, qstIndex) {
    const section = (this.createForm.controls.sections as FormArray).controls[
      sectionIndex
      ] as FormGroup;
    const question = (section.controls.questions as FormArray).controls[qstIndex] as FormGroup;
    (question.controls.answers as FormArray).push(this.createAnswer());
  }

  createAnswer(): FormGroup {
    return this.formBuilder.group({
      answer: ['', Validators.required],
      description: ['', Validators.required],
      weight: [20, Validators.required],
      is_not_applicable: [false, Validators.required]
    });
  }

  /*********
   * GAP Manipulation methods
   */

  chooseIfApplicable(event) {
    if (event.target.checked) {
    } else {
    }
  }

  chooseIfAnswerApplicable(event) {
    if (event.target.checked) {
    } else {
    }
  }

  /*********
   * Section Answers Form Manipulation methods
   */


  onQuestionTypeSelected(sectionIndex: number, qstIndex: number) {
    const questions = this.getSectionQuestions(sectionIndex).controls;
    const question = questions[qstIndex] as FormGroup;

    if (question.controls.question_type.value === 'multiple_single' || question.controls.question_type.value === 'multiple_apply') {
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

  getQuestionApplicable(sectionIndex: number, qstIndex: number) {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('is_not_applicable');
  }

  getAnswerApplicable(sectionIndex: number, qstIndex: number, answIndex: number) {
    return this.getQuestionAnswers(sectionIndex, qstIndex).at(answIndex).get('is_not_applicable').value;
  }

  getSectionQuestions(qIndex: number): FormArray {
    return this.getQuestionSections.at(qIndex).get('questions') as FormArray;
  }

  getQuestionAnswers(sectionIndex: number, qstIndex: number): FormArray {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('answers') as FormArray;
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

  removeQuestion(sectionIndex, qstIndex){
    this.getSectionQuestions(sectionIndex).removeAt(qstIndex);
  }

  onSubmit() {
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

      console.log(gap);

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

  ngOnDestroy() {
  }
}
