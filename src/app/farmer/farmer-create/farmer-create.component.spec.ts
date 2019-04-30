import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerCreateComponent } from './farmer-create.component';

describe('FarmerCreateComponent', () => {
  let component: FarmerCreateComponent;
  let fixture: ComponentFixture<FarmerCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FarmerCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
