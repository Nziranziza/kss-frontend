import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFarmVisitComponent } from './view-farm-visit.component';

describe('ViewFarmVisitComponent', () => {
  let component: ViewFarmVisitComponent;
  let fixture: ComponentFixture<ViewFarmVisitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFarmVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFarmVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
