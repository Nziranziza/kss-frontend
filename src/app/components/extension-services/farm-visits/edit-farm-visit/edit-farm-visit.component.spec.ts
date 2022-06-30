import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFarmVisitComponent } from './edit-farm-visit.component';

describe('EditFarmVisitComponent', () => {
  let component: EditFarmVisitComponent;
  let fixture: ComponentFixture<EditFarmVisitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFarmVisitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFarmVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
