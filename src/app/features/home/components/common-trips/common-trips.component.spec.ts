import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTripsComponent } from './common-trips.component';

describe('CommonTripsComponent', () => {
  let component: CommonTripsComponent;
  let fixture: ComponentFixture<CommonTripsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonTripsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonTripsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
