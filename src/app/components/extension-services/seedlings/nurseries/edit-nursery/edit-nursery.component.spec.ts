import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNurseryComponent } from './edit-nursery.component';

describe('EditNurseryComponent', () => {
  let component: EditNurseryComponent;
  let fixture: ComponentFixture<EditNurseryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditNurseryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNurseryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
