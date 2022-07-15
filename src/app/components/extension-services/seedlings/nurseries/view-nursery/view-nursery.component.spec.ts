import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNurseryComponent } from './view-nursery.component';

describe('ViewNurseryComponent', () => {
  let component: ViewNurseryComponent;
  let fixture: ComponentFixture<ViewNurseryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewNurseryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewNurseryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
