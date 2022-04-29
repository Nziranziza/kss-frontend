import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeVarietyEditComponent } from './tree-variety-edit.component';

describe('TreesVarietyEditComponent', () => {
  let component: TreeVarietyEditComponent;
  let fixture: ComponentFixture<TreeVarietyEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeVarietyEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeVarietyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
