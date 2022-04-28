import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreesVarietyEditComponent } from './trees-variety-edit.component';

describe('TreesVarietyEditComponent', () => {
  let component: TreesVarietyEditComponent;
  let fixture: ComponentFixture<TreesVarietyEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreesVarietyEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreesVarietyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
