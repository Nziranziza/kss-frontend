import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseryCreateComponent } from './nursery-create.component';

describe('NurseryCreateComponent', () => {
  let component: NurseryCreateComponent;
  let fixture: ComponentFixture<NurseryCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NurseryCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NurseryCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
