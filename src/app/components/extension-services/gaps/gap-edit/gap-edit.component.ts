import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {Answer, BasicComponent, Gap, GapService, HelperService, MessageService, Question, Section} from '../../../../core';

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
    {id: 'mark_input', name: 'Marks Input'},
    {id: 'multiple_single', name: 'Multiple Choice - Single'},
    {id: 'yes_no', name: 'Yes/No'},
    {
      id: 'multiple_apply',
      name: 'Multiple Choice - All that Apply',
    }
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

  get getQuestionSections() {
    return this.createForm.get('sections') as FormArray;
  }

  get name() {
    return this.createForm.get('name');
  }

  get description() {
    return this.createForm.get('description');
  }

  get formCategory() {
    return this.createForm.get('questions') as FormArray;
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
    this.route.params.subscribe((params) => {
      this.id = params['id'.toString()];
    });

    this.createForm = this.formBuilder.group({
      _id: [''],
      gap_name: ['', Validators.required],
      sections: new FormArray([], Validators.required),
      gap_weight: ['', Validators.required],
      gap_score: ['', Validators.required],
      picture_text: ['', Validators.required]
    });

    this.getGap();

    this.initial();
    this.setMessage(this.messageService.getMessage());
  }

  getGap() {
    this.gapService.one(this.id).subscribe((data) => {
      if (data && data.data) {
        this.gap = data.data;
        this.createForm.controls._id.setValue(this.gap._id);
        this.createForm.controls.gap_name.setValue(this.gap.gap_name);
        this.createForm.controls.gap_weight.setValue(this.gap.gap_weight);
        this.createForm.controls.gap_score.setValue(this.gap.gap_score);
        this.createForm.controls.picture_text.setValue(this.gap.picture_text);
        this.gap.sections.forEach((value, index) => {
          this.populateSections(value, index);
        });
      }
    });
  }

  populateSections(element: Section, index: number) {
    const sections = this.createForm.controls.sections as FormArray;
    sections.push(this.createQuestionSection());
    sections.at(index).get('_id').setValue(element._id);
    sections.at(index).get('section_name').setValue(element.section_name);
    element.questions.forEach((value, sectionIndex) => {
      this.populateQuestions(value, index, sectionIndex);
    });
  }

  populateQuestions(question: Question, sectionIndex: number, qstIndex: number) {
    const questions = this.getSectionQuestions(sectionIndex).controls;
    questions.push(this.createQuestion());
    questions.at(qstIndex).get('_id').setValue(question._id);
    questions.at(qstIndex).get('question').setValue(question.question);
    questions.at(qstIndex).get('question_type').setValue(question.question_type);
    questions.at(qstIndex).get('weight').setValue(question.weight);
    questions.at(qstIndex).get('description').setValue(question.description);
    questions.at(qstIndex).get('is_not_applicable').setValue(question.is_not_applicable);
    question.answers.forEach((value, answerIndex) => {
      this.populateAnswers(value, sectionIndex, qstIndex, answerIndex);
    });
  }

  populateAnswers(answer: Answer, sectionIndex: number, qstIndex: number, answerIndex:number){
    const answers = this.getQuestionAnswers(sectionIndex, qstIndex);
    answers.push(this.createAnswer());
    answers.at(answerIndex).get('_id').setValue(answer._id);
    answers.at(answerIndex).get('answer').setValue(answer.answer);
    answers.at(answerIndex).get('weight').setValue(answer.weight);
    answers.at(answerIndex).get('description').setValue(answer.description);
    answers.at(answerIndex).get('is_not_applicable').setValue(answer.is_not_applicable);
  }

  // Method creates a new Form Group for a question
  createQuestionSection(): FormGroup {
    return this.formBuilder.group({
      _id: [''],
      section_name: ['', Validators.required],
      questions: new FormArray([])
    });
  }

  getSectionQuestions(qIndex: number): FormArray {
    return this.getQuestionSections.at(qIndex).get('questions') as FormArray;
  }

  getQuestionAnswers(sectionIndex: number, qstIndex: number): FormArray {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('answers') as FormArray;
  }

  getAnswerApplicable(sectionIndex: number, qstIndex: number, answIndex: number) {
    return this.getQuestionAnswers(sectionIndex, qstIndex).at(answIndex).get('is_not_applicable').value;
  }

  getQuestionType(sectionIndex: number, qstIndex: number) {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('question_type')
  }

  getQuestionApplicable(sectionIndex: number, qstIndex: number) {
    return this.getSectionQuestions(sectionIndex).at(qstIndex).get('is_not_applicable');
  }

  getSectionName(index: number) {
    return this.getQuestionSections.at(index).get('section_name');
  }

  // Method Add a new question section to the GAP form
  addQuestionSection() {
    const sections = (this.createForm.controls.sections as FormArray);
    sections.push(this.createQuestionSection());
    this.addQuestionToSection(sections.length - 1);
  }


  // Method Add a new question section to the GAP form
  addQuestionToSection(sectionIndex) {
    const section = (this.createForm.controls.sections as FormArray).controls[
      sectionIndex
      ] as FormGroup;

    (section.controls.questions as FormArray).push(this.createQuestion());
  }

  addAnswersToQuestion(sectionIndex, qstIndex) {
    const section = (this.createForm.controls.sections as FormArray).controls[
      sectionIndex
      ] as FormGroup;
    const question = (section.controls.questions as FormArray).controls[qstIndex] as FormGroup;
    (question.controls.answers as FormArray).push(this.createAnswer());
  }

  removeQuestionAnswer(sectionIndex, qstIndex, ansIndex) {
    this.getQuestionAnswers(sectionIndex, qstIndex).removeAt(ansIndex);
  }


  removeQuestionSection(sectionIndex: number) {
    this.getQuestionSections.removeAt(sectionIndex);
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

  checkIFMultipleQuestion(sectionIndex: number, qstIndex: number) {
    const type = this.getQuestionType(sectionIndex, qstIndex);
    return type.value === 'multiple_single' || type.value === 'multiple_apply';
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

  addAnswers(element: Answer, qIndex: number, aIndex: number) {
    const question = (this.createForm.controls.questions as FormArray).controls[
      qIndex
      ] as FormGroup;

    const answers = question.controls.answers as FormArray;
    answers.push(this.createAnswer());
    answers.at(aIndex).get('_id').setValue(element._id);
    answers.at(aIndex).get('answer').setValue(element.answer);
    answers.at(aIndex).get('weight').setValue(element.weight);
    answers.at(aIndex).get('description').setValue(element.description);
    answers.at(aIndex).get('is_not_applicable').setValue(element.is_not_applicable);
  }

  removeQuestion(sectionIndex, qstIndex){
    this.getSectionQuestions(sectionIndex).removeAt(qstIndex);
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
      _id: [''],
      question: ['', Validators.required],
      description: ['', Validators.required],
      question_type: ['', Validators.required],
      weight: ['', Validators.required],
      answers: new FormArray([]),
      is_not_applicable: [false, Validators.required]
    });
  }

  createAnswer(): FormGroup {
    return this.formBuilder.group({
      _id: [''],
      answer: ['', Validators.required],
      description: ['', Validators.required],
      weight: ['', Validators.required],
      is_not_applicable: [false, Validators.required]
    });
  }

  onCancel() {
    // this.location.back();
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

  initial() {
  }

  ngOnDestroy() {
  }
}
