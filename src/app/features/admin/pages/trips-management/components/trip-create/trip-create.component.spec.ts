import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripCreateComponent } from './trip-create.component';

describe('TripCreateComponent', () => {
  let component: TripCreateComponent;
  let fixture: ComponentFixture<TripCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
