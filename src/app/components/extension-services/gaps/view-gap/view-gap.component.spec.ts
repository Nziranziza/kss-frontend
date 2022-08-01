import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGapComponent } from './view-gap.component';

describe('ViewGapComponent', () => {
  let component: ViewGapComponent;
  let fixture: ComponentFixture<ViewGapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewGapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
