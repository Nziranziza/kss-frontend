import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreesVarietyListComponent } from './trees-variety-list.component';

describe('TreesVarietyComponent', () => {
  let component: TreesVarietyListComponent;
  let fixture: ComponentFixture<TreesVarietyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreesVarietyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreesVarietyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
