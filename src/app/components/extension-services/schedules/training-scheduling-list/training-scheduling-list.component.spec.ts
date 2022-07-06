import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingSchedulingListComponent } from './training-scheduling-list.component';

describe('TrainingSchedulingListComponent', () => {
  let component: TrainingSchedulingListComponent;
  let fixture: ComponentFixture<TrainingSchedulingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingSchedulingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingSchedulingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
