import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingScheduleEditComponent } from './training-schedule-edit.component';

describe('TrainingScheduleEditComponent', () => {
  let component: TrainingScheduleEditComponent;
  let fixture: ComponentFixture<TrainingScheduleEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingScheduleEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingScheduleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
