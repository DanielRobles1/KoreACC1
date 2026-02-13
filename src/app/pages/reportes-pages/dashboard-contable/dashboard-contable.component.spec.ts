import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardContableComponent } from './dashboard-contable.component';

describe('DashboardContableComponent', () => {
  let component: DashboardContableComponent;
  let fixture: ComponentFixture<DashboardContableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardContableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardContableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
