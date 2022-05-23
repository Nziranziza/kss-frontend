import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeVarietiesListComponent } from './tree-varieties-list.component';

describe('TreesVarietyComponent', () => {
  let component: TreeVarietiesListComponent;
  let fixture: ComponentFixture<TreeVarietiesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreeVarietiesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeVarietiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
