import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeVarietyCreateComponent } from './tree-variety-create.component';

describe('TreesVarietyCreateComponent', () => {
  let component: TreeVarietyCreateComponent;
  let fixture: ComponentFixture<TreeVarietyCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeVarietyCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeVarietyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
