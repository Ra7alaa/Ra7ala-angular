import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsManagementComponent } from './trips-management.component';

describe('TripsManagementComponent', () => {
  let component: TripsManagementComponent;
  let fixture: ComponentFixture<TripsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
