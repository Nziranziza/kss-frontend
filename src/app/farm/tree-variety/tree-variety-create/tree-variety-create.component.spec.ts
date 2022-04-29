import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreesVarietyCreateComponent } from './trees-variety-create.component';

describe('TreesVarietyCreateComponent', () => {
  let component: TreesVarietyCreateComponent;
  let fixture: ComponentFixture<TreesVarietyCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreesVarietyCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreesVarietyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
