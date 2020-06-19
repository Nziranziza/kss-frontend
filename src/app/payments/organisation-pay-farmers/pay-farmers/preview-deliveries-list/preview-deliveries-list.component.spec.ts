import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDeliveriesListComponent } from './preview-deliveries-list.component';

describe('PreviewDeliveriesListComponent', () => {
  let component: PreviewDeliveriesListComponent;
  let fixture: ComponentFixture<PreviewDeliveriesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewDeliveriesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDeliveriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
